import { useState } from 'react';
import { Menu, X, ArrowUpRight, CalendarDays, ClipboardList, Users, ShieldCheck } from 'lucide-react';
import { About } from './About';
import { System32Brand } from './System32Brand';

const links = [['Quem somos', '#quem-somos'], ['Como funciona', '#como-funciona'], ['Perfis de acesso', '#perfis'], ['Atendimento', '#atendimento']];
export default function ClinicPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="clinic-page">
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="clinic-header"><div className="clinic-wrap header-inner">
      <a href="#inicio" className="clinic-wordmark" aria-label="Medisys, início"><span className="clinic-mark" aria-hidden="true">m<span>+</span></span><span>medi<b>sys</b><small>POR SYSTEM32</small></span></a>
      <nav className="desktop-nav" aria-label="Navegação principal">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
      <button className="mobile-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </div>{menuOpen && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Navegação móvel">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>}</header>
    <main id="conteudo">
      <section id="inicio" className="clinic-hero"><div className="clinic-wrap hero-grid">
        <div><p className="clinic-kicker">MEDISYS / GESTÃO CLÍNICA</p><h1>Mais organização.<br /><span>Mais atenção<br />ao cuidado.</span></h1><p className="hero-description">Uma proposta para organizar consultas, exames e informações da clínica, com uma experiência pensada para cada perfil de usuário.</p><a className="clinic-button" href="#como-funciona">Conheça a proposta <ArrowUpRight size={18} /></a><p className="prototype-note">Protótipo acadêmico de interface · Sem acesso a dados reais</p></div>
        <div className="care-panel"><div className="panel-top"><span>NA ROTINA DA CLÍNICA</span><span className="status-dot" aria-hidden="true" /></div><h2>Informação organizada.<br />Cuidado conectado.</h2><div className="care-row"><CalendarDays /><div><h3>Consultas</h3><p>Organização da agenda pela equipe responsável.</p></div></div><div className="care-row"><ClipboardList /><div><h3>Exames e resultados</h3><p>Informações reunidas para acompanhamento.</p></div></div><div className="care-row"><ShieldCheck /><div><h3>Acesso por perfil</h3><p>Cada pessoa com as permissões do seu papel.</p></div></div><div className="panel-bottom">Uma clínica. Diferentes necessidades.</div></div>
      </div></section>
      <section id="como-funciona" className="clinic-wrap clinic-section"><p className="clinic-kicker">COMO FUNCIONA</p><h2>Uma jornada organizada pela equipe.</h2><div className="steps-grid">{[
        ['01', 'Fale com a clínica', 'O paciente procura o atendimento para solicitar informações sobre consultas ou exames.'],
        ['02', 'A equipe organiza', 'Atendentes e administradores realizam agendamentos, reagendamentos e cancelamentos conforme as regras da clínica.'],
        ['03', 'Acompanhe suas informações', 'No sistema previsto, o paciente consulta seus próprios agendamentos, exames e resultados.'],
      ].map(([number, title, text]) => <article key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <About />
      <section id="perfis" className="clinic-wrap clinic-section"><p className="clinic-kicker">PERFIS DE ACESSO</p><h2>Cada papel tem seu espaço.</h2><p className="section-description">Permissões previstas na documentação do Medisys. Esta página apresenta os perfis; não oferece autenticação.</p><div className="roles-grid">{[
        ['Paciente', 'Consulta apenas seus próprios agendamentos, exames e resultados. Não cria, altera ou cancela agendamentos.'],
        ['Atendente', 'Gerencia cadastros e agendamentos da clínica e registra resultados, conforme suas permissões.'],
        ['Médico', 'Consulta os agendamentos vinculados a ele e os exames e resultados dos pacientes.'],
        ['Administrador', 'Gerencia usuários, perfis, configurações e auditoria, além das operações da clínica.'],
      ].map(([title, text]) => <article key={title}><Users size={22} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section id="atendimento" className="clinic-wrap contact-section"><div><p className="clinic-kicker">ATENDIMENTO</p><h2>Precisa agendar ou reagendar?</h2><p>Procure a equipe de atendimento da clínica. Os agendamentos são feitos por atendentes e administradores.</p></div><aside><strong>Canais de contato</strong><p>Os contatos oficiais da clínica ainda não foram definidos para este protótipo.</p></aside></section>
    </main><footer className="clinic-footer"><div className="clinic-wrap footer-inner"><System32Brand /><p>Medisys · Projeto acadêmico<br /><span>Interface demonstrativa, sem banco de dados ou agendamento real.</span></p><a href="#inicio">Voltar ao início ↑</a></div></footer>
  </div>;
}
