import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Never accept the application's production connection implicitly.
const url = new URL(process.env.INTEGRATION_DATABASE_URL || '');
assert(['localhost', '127.0.0.1'].includes(url.hostname), 'Use a local PostgreSQL test database');
assert.equal(url.pathname, '/medisys_integration', 'Use the dedicated medisys_integration database');
const schema = `integration_${randomUUID().replaceAll('-', '')}`;
url.searchParams.set('schema', schema);
const port = Number(process.env.INTEGRATION_PORT || 4197);
const env = { ...process.env, DATABASE_URL: url.href, DIRECT_URL: url.href,
  SESSION_SECRET: randomUUID() + randomUUID(), NEXT_TELEMETRY_DISABLED: '1' };
const db = new PrismaClient({ datasources: { db: { url: url.href } } });
const reports = [];
let server;
let log = '';
const password = 'Integration-test-only-123';
const base = `http://127.0.0.1:${port}`;
const run = (file, args) => {
  const r = spawnSync(process.execPath, [file, ...args], { env, encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) throw new Error(r.stdout + r.stderr);
};
async function check(name, action) {
  try { await action(); reports.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
  catch (e) { reports.push({ name, status: 'FAIL', error: e.message }); throw e; }
}
async function api(cookie, path, method = 'GET', data) {
  const response = await fetch(base + path, { method, redirect: 'manual',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: data === undefined ? undefined : JSON.stringify(data), signal: AbortSignal.timeout(60000) });
  const text = await response.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  return { status: response.status, body, headers: response.headers };
}
const expectStatus = (r, status) => assert.equal(r.status, status, JSON.stringify(r.body).slice(0, 600));
async function login(cpf, pwd = password) {
  const r = await api(null, '/api/auth/login', 'POST', { cpf, password: pwd });
  expectStatus(r, 200);
  const cookie = r.headers.get('set-cookie')?.split(';')[0];
  assert(cookie); return cookie;
}
function cpf(seed) {
  const digits = String(seed).padStart(9, '0').split('').map(Number);
  for (let length = 9; length < 11; length++) {
    const n = (digits.reduce((s, d, i) => s + d * (length + 1 - i), 0) * 10) % 11;
    digits.push(n === 10 ? 0 : n);
  }
  return digits.join('');
}
const address = { zipCode: '76801000', street: 'Rua Teste', number: '10', neighborhood: 'Centro', city: 'Porto Velho', state: 'RO', complement: 'Teste' };
const date = (offset) => new Date(Date.now() + offset * 86400000).toISOString();
try {
  run('node_modules/prisma/build/index.js', ['migrate', 'deploy']);
  const passwordHash = await bcrypt.hash(password, 12);
  const users = {};
  for (const [i, role] of ['ADMINISTRADOR', 'ATENDENTE', 'MEDICO', 'PACIENTE', 'PACIENTE', 'MEDICO'].entries()) {
    users[i] = await db.user.create({ data: { cpf: cpf(900000100 + i), fullName: `Teste ${role}`,
      birthDate: new Date('2000-01-01'), phone: '69999999999', passwordHash, role, mustChangePassword: false,
      address: { create: address } } });
  }
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)], { env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', d => { log += d; }); server.stderr.on('data', d => { log += d; });
  server.on('error', e => { log += e.message; });
  let ready = false;
  for (let i = 0; i < 90; i++) {
    try { const r = await fetch(base + '/login', { signal: AbortSignal.timeout(3000) }); if (r.ok) { ready = true; break; } } catch {}
    if (server.exitCode !== null) break;
    await new Promise(r => setTimeout(r, 1000));
  }
  assert(ready, `Server failed to start: ${log.slice(-3000)}`);
  const sessions = {};
  await check('Login real com os quatro perfis e renderização do dashboard', async () => {
    for (let i = 0; i < 6; i++) {
      sessions[i] = await login(users[i].cpf);
      expectStatus(await api(sessions[i], '/dashboard'), 200);
    }
  });
  const [admin, attendant, doctor, patient, otherPatient] = Object.values(sessions);
  await check('Autenticação obrigatória e permissões administrativas', async () => {
    expectStatus(await api(null, '/api/consultations'), 401);
    expectStatus(await api(patient, '/api/users'), 403);
    expectStatus(await api(doctor, '/api/users'), 403);
    expectStatus(await api(attendant, '/api/users'), 200);
    expectStatus(await api(patient, '/api/consultations', 'POST', {}), 403);
    expectStatus(await api(doctor, '/api/consultations', 'POST', {}), 403);
  });
  let registered;
  await check('Cadastro via API, primeiro acesso e troca obrigatória de senha', async () => {
    const r = await api(attendant, '/api/users', 'POST', { cpf: cpf(900000199), fullName: 'Paciente Integracao',
      birthDate: '2000-01-01', phone: '69999999999', password, role: 'PACIENTE', address, email: 'fixture@example.test' });
    expectStatus(r, 201); registered = r.body;
    let cookie = await login(registered.cpf);
    expectStatus(await api(cookie, '/api/consultations'), 403);
    expectStatus(await api(cookie, '/api/auth/change-password', 'POST', { currentPassword: password, newPassword: password + 'new' }), 200);
    expectStatus(await api(cookie, '/api/consultations'), 401);
    cookie = await login(registered.cpf, password + 'new');
    expectStatus(await api(cookie, '/api/consultations'), 200);
  });
  await check('Edição remove campos opcionais e mantém data de nascimento', async () => {
    expectStatus(await api(attendant, `/api/users/${registered.id}`, 'PATCH', { cpf: registered.cpf,
      fullName: 'Paciente Integracao', birthDate: '2000-01-01', phone: '69999999999', email: null,
      healthInsurance: null, sex: null, address: { ...address, complement: null } }), 200);
    const u = await db.user.findUnique({ where: { id: registered.id }, include: { address: true } });
    assert.equal(u.email, null); assert.equal(u.address.complement, null);
    assert.equal(u.birthDate.toISOString(), '2000-01-01T00:00:00.000Z');
  });
  let examType, first, second;
  const firstDate = date(10), secondDate = date(11), thirdDate = date(12);
  await check('Catálogo e agendamento persistem com auditoria', async () => {
    const t = await api(admin, '/api/exam-types', 'POST', { name: 'Exame Integracao', description: 'Exame ficticio' });
    expectStatus(t, 201); examType = t.body;
    for (const scheduledAt of [firstDate, secondDate]) {
      const r = await api(attendant, '/api/consultations', 'POST', { patientId: users[3].id, doctorId: users[2].id, scheduledAt });
      expectStatus(r, 201); if (!first) first = r.body; else second = r.body;
    }
    assert.equal((await db.consultation.findUnique({ where: { id: first.id } })).scheduledAt.toISOString(), firstDate);
    assert(await db.auditLog.count({ where: { action: 'CONSULTA_AGENDADA', entityId: first.id } }));
  });
  await check('Conflitos de médico/paciente e datas passadas são recusados', async () => {
    expectStatus(await api(attendant, '/api/consultations', 'POST', { patientId: users[4].id, doctorId: users[2].id, scheduledAt: firstDate }), 409);
    expectStatus(await api(attendant, '/api/exams', 'POST', { patientId: users[3].id, examTypeId: examType.id, scheduledAt: firstDate }), 409);
    expectStatus(await api(attendant, '/api/consultations', 'POST', { patientId: users[3].id, doctorId: users[2].id, scheduledAt: date(-1) }), 400);
  });
  await check('Paciente e médico veem apenas suas consultas', async () => {
    const r = await api(attendant, '/api/consultations', 'POST', { patientId: users[4].id, doctorId: users[5].id, scheduledAt: firstDate });
    expectStatus(r, 201);
    for (const [cookie, field, id] of [[patient, 'patientId', users[3].id], [doctor, 'doctorId', users[2].id], [otherPatient, 'patientId', users[4].id]]) {
      const list = await api(cookie, '/api/consultations'); expectStatus(list, 200);
      assert(list.body.length > 0); assert(list.body.every(row => row[field] === id));
    }
  });
  await check('Reagendamento conflitante reverte status, histórico e auditoria', async () => {
    const before = await db.auditLog.count();
    expectStatus(await api(attendant, `/api/consultations/${first.id}`, 'PATCH', { status: 'REAGENDADA', justification: 'Teste conflito', scheduledAt: secondDate }), 409);
    assert.equal((await db.consultation.findUnique({ where: { id: first.id } })).status, 'AGENDADA');
    assert.equal(await db.appointmentHistory.count({ where: { consultationId: first.id } }), 0);
    assert.equal(await db.auditLog.count(), before);
  });
  await check('Reagendamento válido preserva vínculo e libera horário', async () => {
    const r = await api(attendant, `/api/consultations/${first.id}`, 'PATCH', { status: 'REAGENDADA', justification: 'Teste reagendamento', scheduledAt: thirdDate });
    expectStatus(r, 200);
    const replacement = await db.consultation.findUnique({ where: { id: r.body.replacementId } });
    assert.equal(replacement.rescheduledFromId, first.id);
    assert.equal(replacement.scheduledAt.toISOString(), thirdDate);
    expectStatus(await api(attendant, '/api/consultations', 'POST', { patientId: users[3].id, doctorId: users[2].id, scheduledAt: firstDate }), 201);
  });
  await check('Cancelamento exige justificativa e libera reserva', async () => {
    expectStatus(await api(attendant, `/api/consultations/${second.id}`, 'PATCH', { status: 'CANCELADA' }), 400);
    expectStatus(await api(attendant, `/api/consultations/${second.id}`, 'PATCH', { status: 'CANCELADA', justification: 'Teste cancelamento' }), 200);
    expectStatus(await api(attendant, '/api/consultations', 'POST', { patientId: users[3].id, doctorId: users[2].id, scheduledAt: secondDate }), 201);
  });
  let exam;
  await check('Exame, resultado e correção preservam versões anteriores', async () => {
    const r = await api(attendant, '/api/exams', 'POST', { patientId: users[3].id, examTypeId: examType.id, scheduledAt: date(20) });
    expectStatus(r, 201); exam = r.body;
    for (const status of ['REALIZADO', 'RESULTADO_PENDENTE']) expectStatus(await api(attendant, `/api/exams/${exam.id}`, 'PATCH', { status }), 200);
    for (const version of [1, 2]) {
      const result = await api(attendant, `/api/exams/${exam.id}/results`, 'POST', { content: `Resultado ficticio versao ${version}` });
      expectStatus(result, 201); assert.equal(result.body.version, version);
    }
    const versions = await db.examResultVersion.findMany({ where: { examId: exam.id }, orderBy: { version: 'asc' } });
    assert.equal(versions.length, 2); assert.equal(versions[0].content, 'Resultado ficticio versao 1');
    assert.equal((await db.examAppointment.findUnique({ where: { id: exam.id } })).status, 'RESULTADO_DISPONIVEL');
  });
  await check('Resultados: leitura autorizada, escrita restrita e isolamento do paciente', async () => {
    for (const cookie of [doctor, patient]) {
      expectStatus(await api(cookie, `/api/exams/${exam.id}/results`, 'POST', { content: 'Nao permitido' }), 403);
      const r = await api(cookie, `/exames/${exam.id}/resultados`); expectStatus(r, 200);
      assert(r.body.includes('Resultado ficticio versao 2'));
    }
    const outsider = await api(otherPatient, `/exames/${exam.id}/resultados`);
    assert(!outsider.body.includes('Resultado ficticio versao 2'));
    const list = await api(otherPatient, '/api/exams'); expectStatus(list, 200); assert(!list.body.some(row => row.id === exam.id));
  });
  await check('Cinco falhas simultâneas bloqueiam conta no PostgreSQL', async () => {
    const responses = await Promise.all(Array.from({ length: 5 }, () => api(null, '/api/auth/login', 'POST', { cpf: users[4].cpf, password: 'wrong-password' })));
    assert(responses.every(r => [401, 423].includes(r.status)));
    const u = await db.user.findUnique({ where: { id: users[4].id } });
    assert.equal(u.failedLoginCount, 5); assert.equal(u.status, 'BLOQUEADO');
    assert.equal(await db.auditLog.count({ where: { actorId: u.id, action: 'CONTA_BLOQUEADA' } }), 1);
    expectStatus(await api(otherPatient, '/api/consultations'), 401);
  });
  await check('Administrador desbloqueia e redefine senha invalidando sessão antiga', async () => {
    expectStatus(await api(attendant, `/api/users/${users[4].id}/access`, 'POST', { action: 'unlock' }), 403);
    expectStatus(await api(admin, `/api/users/${users[4].id}/access`, 'POST', { action: 'unlock' }), 200);
    assert.equal((await db.user.findUnique({ where: { id: users[4].id } })).failedLoginCount, 0);
    const old = await login(users[4].cpf);
    expectStatus(await api(admin, `/api/users/${users[4].id}/access`, 'POST', { action: 'reset', password: password + 'reset' }), 200);
    expectStatus(await api(old, '/api/consultations'), 401);
    const temporary = await login(users[4].cpf, password + 'reset');
    expectStatus(await api(temporary, '/api/consultations'), 403);
    assert(await db.auditLog.count({ where: { action: 'SENHA_REDEFINIDA', entityId: users[4].id } }));
  });
  await check('Logout retorna 303, remove cookie e abre login via GET', async () => {
    const r = await api(patient, '/api/auth/logout', 'POST'); expectStatus(r, 303);
    assert(r.headers.get('set-cookie').includes('medisys_session=;'));
    assert(r.headers.get('location').endsWith('/login'));
    expectStatus(await api(null, '/login'), 200);
  });
} catch (error) {
  console.error(error); process.exitCode = 1;
} finally {
  if (server?.pid) {
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { windowsHide: true });
    server.kill('SIGTERM');
    server.stdout.destroy(); server.stderr.destroy(); server.unref();
  }
  await db.$disconnect();
  mkdirSync('integration-results', { recursive: true });
  writeFileSync('integration-results/report.json', JSON.stringify({ date: new Date().toISOString(), schema, passed: reports.filter(r => r.status === 'PASS').length, scenarios: reports, complete: reports.length === 15 && reports.every(r => r.status === 'PASS') }, null, 2));
  writeFileSync('integration-results/server.log', log);
  console.log('Report: integration-results/report.json (isolated schema retained for inspection)');
}
