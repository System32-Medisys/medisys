import { About } from "./components/About";
import { System32Brand } from "./components/System32Brand";
import { useState, useRef } from "react";
import {
  Star, Menu, X, CheckCircle, Building2, ChevronDown,
  Calendar, ChevronLeft, ChevronRight, Heart, ArrowRight, MapPin,
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Hospital {
  id: number;
  name: string;
  city: string;
  specialties: number;
  rating: number;
  reviews: number;
  photoId: string;
  badge: string | null;
  desc: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  crm: string;
  rating: number;
  availability: string;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const HOSPITALS: Hospital[] = [
  { id: 1, name: "Hospital Albert Einstein", city: "São Paulo, SP", specialties: 42, rating: 4.9, reviews: 1842, photoId: "photo-1586773860418-d37222d8fce3", badge: "Top Avaliado", desc: "Referência nacional em excelência médica" },
  { id: 2, name: "Hospital Sírio-Libanês", city: "São Paulo, SP", specialties: 38, rating: 4.8, reviews: 2103, photoId: "photo-1519494026892-80bbd2d6fd0d", badge: "Mais Procurado", desc: "Especializado em oncologia e cardiologia" },
  { id: 3, name: "Hospital Moinhos de Vento", city: "Porto Alegre, RS", specialties: 35, rating: 4.7, reviews: 987, photoId: "photo-1504439468489-c8920d796a29", badge: null, desc: "Tradição gaúcha em saúde de qualidade" },
  { id: 4, name: "Hospital Alemão Oswaldo Cruz", city: "São Paulo, SP", specialties: 31, rating: 4.6, reviews: 1205, photoId: "photo-1551076805-e1869033e561", badge: null, desc: "120 anos de história e inovação médica" },
  { id: 5, name: "Hospital Santa Catarina", city: "São Paulo, SP", specialties: 28, rating: 4.7, reviews: 764, photoId: "photo-1538108149393-fbbd81895907", badge: null, desc: "Atendimento humanizado com tecnologia avançada" },
  { id: 6, name: "Hospital Samaritano Botafogo", city: "Rio de Janeiro, RJ", specialties: 33, rating: 4.8, reviews: 1432, photoId: "photo-1516549655169-df83a0774514", badge: "Premium", desc: "Excelência em saúde no coração do Rio" },
];

const DOCTORS: Record<number, Doctor[]> = {
  1: [
    { id: 1, name: "Dr. Ricardo Mendes", specialty: "Clínico Geral", crm: "CRM/SP 87342", rating: 4.9, availability: "Hoje disponível" },
    { id: 2, name: "Dra. Fernanda Alves", specialty: "Cardiologia", crm: "CRM/SP 54218", rating: 4.8, availability: "Amanhã" },
    { id: 3, name: "Dr. Carlos Pinheiro", specialty: "Ortopedia", crm: "CRM/SP 32109", rating: 4.7, availability: "Próx. semana" },
    { id: 4, name: "Dra. Luísa Rocha", specialty: "Neurologia", crm: "CRM/SP 76543", rating: 4.9, availability: "Hoje disponível" },
  ],
  2: [
    { id: 5, name: "Dra. Isabela Torres", specialty: "Neurologia", crm: "CRM/SP 61834", rating: 4.9, availability: "Hoje disponível" },
    { id: 6, name: "Dr. Henrique Castro", specialty: "Dermatologia", crm: "CRM/SP 48291", rating: 4.8, availability: "Amanhã" },
    { id: 7, name: "Dr. Paulo Saraiva", specialty: "Cardiologia", crm: "CRM/SP 29174", rating: 4.7, availability: "Esta semana" },
  ],
  3: [
    { id: 8, name: "Dra. Ana Paula Figueiredo", specialty: "Clínico Geral", crm: "CRM/RS 34521", rating: 4.8, availability: "Hoje disponível" },
    { id: 9, name: "Dr. Marcelo Brum", specialty: "Pediatria", crm: "CRM/RS 67890", rating: 4.9, availability: "Amanhã" },
  ],
  4: [
    { id: 10, name: "Dr. Eduardo Negrão", specialty: "Ortopedia", crm: "CRM/SP 43218", rating: 4.7, availability: "Hoje disponível" },
    { id: 11, name: "Dra. Camila Veiga", specialty: "Ginecologia", crm: "CRM/SP 82341", rating: 4.8, availability: "Esta semana" },
    { id: 12, name: "Dr. Thiago Brandão", specialty: "Urologia", crm: "CRM/SP 56712", rating: 4.6, availability: "Próx. semana" },
  ],
  5: [
    { id: 13, name: "Dra. Roberta Machado", specialty: "Dermatologia", crm: "CRM/SP 91234", rating: 4.7, availability: "Hoje disponível" },
    { id: 14, name: "Dr. Felipe Corrêa", specialty: "Pneumologia", crm: "CRM/SP 73461", rating: 4.8, availability: "Amanhã" },
  ],
  6: [
    { id: 15, name: "Dr. André Cavalcanti", specialty: "Cardiologia", crm: "CRM/RJ 21345", rating: 4.9, availability: "Hoje disponível" },
    { id: 16, name: "Dra. Juliana Moraes", specialty: "Endocrinologia", crm: "CRM/RJ 54678", rating: 4.8, availability: "Esta semana" },
    { id: 17, name: "Dr. Rafael Souza", specialty: "Clínico Geral", crm: "CRM/RJ 38901", rating: 4.7, availability: "Hoje disponível" },
  ],
};

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
];

const PAYMENT_OPTIONS = [
  { id: "insurance", label: "Plano de Saúde", icon: "🏥" },
  { id: "credit",   label: "Crédito",         icon: "💳" },
  { id: "debit",    label: "Débito",           icon: "🏧" },
  { id: "pix",      label: "PIX",              icon: "⚡" },
];

const REVIEWS = [
  { name: "Maria Clara Santos",    initials: "MC", role: "Professora",          date: "há 2 dias",    rating: 5, text: "Processo super rápido! Em menos de 5 minutos agendei com um cardiologista. A consulta foi excelente e recebi meu atestado no mesmo dia.",    hospital: "Hospital Albert Einstein" },
  { name: "João Pedro Oliveira",   initials: "JP", role: "Engenheiro de Software", date: "há 3 dias", rating: 5, text: "Plataforma incrível. Consegui minha licença médica sem sair de casa. O Dr. Ricardo foi muito atencioso e profissional.",                   hospital: "Hospital Sírio-Libanês" },
  { name: "Ana Beatriz Lima",      initials: "AB", role: "Analista de RH",       date: "há 5 dias",   rating: 4, text: "Muito prático! Agendei para o dia seguinte e a consulta foi pontual. Recomendo para quem precisa de atestado rápido.",                     hospital: "Hospital Moinhos de Vento" },
  { name: "Carlos Eduardo Ferreira", initials: "CE", role: "Advogado",           date: "há 1 semana", rating: 5, text: "Melhor plataforma de agendamento médico que já usei. Interface clara, médicos qualificados e pagamento via PIX facilitou tudo.",           hospital: "Hospital Albert Einstein" },
  { name: "Patrícia Gomes Ribeiro", initials: "PG", role: "Contadora",           date: "há 1 semana", rating: 5, text: "Encontrei especialista disponível no mesmo dia! A Dra. Fernanda foi incrível. Com certeza voltarei a usar.",                               hospital: "Hospital Alemão Oswaldo Cruz" },
  { name: "Lucas Henrique Moura",  initials: "LH", role: "Designer UX",          date: "há 2 semanas", rating: 4, text: "Sistema de agendamento muito bem feito. Confirmação imediata por e-mail. Atendimento dentro do horário marcado.",                         hospital: "Hospital Santa Catarina" },
  { name: "Fernanda Costa Alves",  initials: "FA", role: "Médica",               date: "há 2 semanas", rating: 5, text: "Usei para consulta de endocrinologia e foi perfeito. Médico pontual e atendimento de altíssima qualidade.",                               hospital: "Hospital Samaritano Botafogo" },
  { name: "Roberto Dias Nascimento", initials: "RD", role: "Gerente Comercial",  date: "há 3 semanas", rating: 5, text: "Excelente experiência do início ao fim. A plataforma tornou simples algo que costumava ser muito complicado.",                             hospital: "Hospital Sírio-Libanês" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getNextDays(n: number) {
  const result = [];
  const today = new Date();
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      key: `${d.getDate()}-${d.getMonth()}`,
      label: i === 0 ? "Hoje" : i === 1 ? "Amanhã" : dayNames[d.getDay()],
      num: d.getDate(),
      month: monthNames[d.getMonth()],
    });
  }
  return result;
}

function doctorInitials(name: string) {
  return name
    .replace(/^Dr[a]?\. /, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
        />
      ))}
    </div>
  );
}

// ─── SUCCESS CARD ─────────────────────────────────────────────────────────────

function SuccessCard({
  hospital, doctor, date, time, payment, onReset,
}: {
  hospital: Hospital;
  doctor: Doctor;
  date: string;
  time: string;
  payment: string;
  onReset: () => void;
}) {
  const paymentLabel = PAYMENT_OPTIONS.find((p) => p.id === payment)?.label ?? payment;
  const [dayNum, monthIdx] = date.split("-");
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const dateLabel = `${dayNum} de ${months[parseInt(monthIdx)]}`;

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={32} className="text-emerald-500" />
      </div>
      <h3 className="text-xl font-extrabold text-slate-800 mb-1">Consulta Agendada!</h3>
      <p className="text-sm text-slate-500 mb-6">
        Confirmação enviada para seu e-mail e WhatsApp.
      </p>
      <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2.5 mb-6">
        {[
          { l: "Hospital",      v: hospital.name },
          { l: "Médico",        v: doctor.name },
          { l: "Especialidade", v: doctor.specialty },
          { l: "Data",          v: dateLabel },
          { l: "Horário",       v: time },
          { l: "Pagamento",     v: paymentLabel },
        ].map(({ l, v }) => (
          <div key={l} className="flex justify-between items-start gap-4 text-xs">
            <span className="font-semibold text-slate-400 shrink-0">{l}</span>
            <span className="font-semibold text-slate-800 text-right">{v}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onReset}
        className="w-full py-3 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 transition-colors"
      >
        Agendar Nova Consulta
      </button>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [mobileOpen,       setMobileOpen]       = useState(false);
  const [hospitalOpen,     setHospitalOpen]     = useState(false);
  const [doctorOpen,       setDoctorOpen]       = useState(false);
  const [selectedHospId,   setSelectedHospId]   = useState<number | null>(null);
  const [selectedDocId,    setSelectedDocId]    = useState<number | null>(null);
  const [selectedDate,     setSelectedDate]     = useState<string | null>(null);
  const [selectedTime,     setSelectedTime]     = useState<string | null>(null);
  const [selectedPayment,  setSelectedPayment]  = useState<string | null>(null);
  const [booked,           setBooked]           = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);

  const days = getNextDays(14);
  const hosp = HOSPITALS.find((h) => h.id === selectedHospId) ?? null;
  const docs = selectedHospId ? (DOCTORS[selectedHospId] ?? []) : [];
  const doc  = docs.find((d) => d.id === selectedDocId) ?? null;
  const filledCount = [selectedHospId, selectedDocId, selectedDate, selectedTime, selectedPayment].filter(Boolean).length;
  const canBook = filledCount === 5;

  const selectHosp = (id: number) => {
    setSelectedHospId(id);
    setSelectedDocId(null);
    setHospitalOpen(false);
  };
  const selectDoc = (id: number) => {
    setSelectedDocId(id);
    setDoctorOpen(false);
  };
  const reset = () => {
    setSelectedHospId(null);
    setSelectedDocId(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedPayment(null);
    setBooked(false);
  };
  const scrollDate = (dir: "l" | "r") =>
    dateRef.current?.scrollBy({ left: dir === "l" ? -190 : 190, behavior: "smooth" });

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      onClick={() => { setHospitalOpen(false); setDoctorOpen(false); }}
    >
      <style>{`
        @keyframes scrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee       { animation: scrollLeft 48s linear infinite; }
        .marquee-wrap:hover .marquee { animation-play-state: paused; }
        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/97 backdrop-blur-sm border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer select-none">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <Heart size={15} className="text-white fill-white" />
            </div>
            <span className="text-lg font-extrabold text-blue-950 tracking-tight leading-tight">
              Med<span className="text-blue-600">Agenda</span><small className="block text-[9px] font-semibold tracking-widest text-slate-500">POR SYSTEM32</small>
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {["Quem Somos", "Como Funciona", "Para Médicos", "Para Hospitais", "Blog"].map((l) => (
              <a key={l} href={l === "Quem Somos" ? "#quem-somos" : "#"} className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">
                {l}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm font-semibold text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
              Entrar
            </button>
            <button className="text-sm font-semibold bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors shadow-sm">
              Criar Conta
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={(e) => { e.stopPropagation(); setMobileOpen(!mobileOpen); }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden bg-white border-t border-blue-50 px-4 py-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {["Quem Somos", "Como Funciona", "Para Médicos", "Para Hospitais", "Blog"].map((l) => (
              <a key={l} href={l === "Quem Somos" ? "#quem-somos" : "#"} onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-600">{l}</a>
            ))}
            <div className="flex gap-3 pt-3">
              <button className="flex-1 py-2.5 text-sm font-semibold border border-blue-700 text-blue-700 rounded-lg">
                Entrar
              </button>
              <button className="flex-1 py-2.5 text-sm font-semibold bg-blue-700 text-white rounded-lg">
                Criar Conta
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section id="agendamento"
        className="pt-16"
        style={{ background: "linear-gradient(140deg, #0b3585 0%, #1560be 52%, #0285a4 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
          {/* Headline */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5 border border-white/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Plataforma nº 1 em agendamento médico no Brasil
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-3">
              Agende sua Consulta<br />
              <span className="text-sky-300">Médica Online</span>
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Selecione o hospital, o especialista e o horário — confirme em minutos.
              Atestado e licença médica garantidos.
            </p>
          </div>

          {/* BOOKING FORM / SUCCESS STATE */}
          {booked && hosp && doc ? (
            <SuccessCard
              hospital={hosp}
              doctor={doc}
              date={selectedDate!}
              time={selectedTime!}
              payment={selectedPayment!}
              onReset={reset}
            />
          ) : (
            <div
              className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 max-w-4xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600" />
                  Agendar Consulta
                </h2>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`w-5 h-1.5 rounded-full transition-colors ${
                        i < filledCount ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-slate-400 font-medium ml-1">{filledCount}/5</span>
                </div>
              </div>

              {/* Row 1: Hospital + Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* Hospital dropdown */}
                <div className="relative">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                    Hospital
                  </label>
                  <button
                    className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-left hover:border-blue-400 transition-colors bg-slate-50/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHospitalOpen(!hospitalOpen);
                      setDoctorOpen(false);
                    }}
                  >
                    <span className={hosp ? "text-slate-800 font-semibold" : "text-slate-400"}>
                      {hosp ? hosp.name : "Selecione o hospital"}
                    </span>
                    <ChevronDown size={14} className="text-slate-400 shrink-0 ml-2" />
                  </button>
                  {hospitalOpen && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 max-h-60 overflow-y-auto no-scroll">
                      {HOSPITALS.map((h) => (
                        <button
                          key={h.id}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors border-b border-slate-50 last:border-0"
                          onClick={(e) => { e.stopPropagation(); selectHosp(h.id); }}
                        >
                          <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                            <Building2 size={12} className="text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-800 leading-tight">{h.name}</div>
                            <div className="text-xs text-slate-500">{h.city} · {h.specialties} especialidades</div>
                          </div>
                          {h.badge && (
                            <span className="shrink-0 text-[10px] font-extrabold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md">
                              {h.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Doctor dropdown */}
                <div className="relative">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                    Médico Especialista
                  </label>
                  <button
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 border rounded-xl text-sm text-left transition-colors ${
                      selectedHospId
                        ? "border-slate-200 hover:border-blue-400 bg-slate-50/80"
                        : "border-slate-100 bg-slate-50/40 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedHospId) { setDoctorOpen(!doctorOpen); setHospitalOpen(false); }
                    }}
                    disabled={!selectedHospId}
                  >
                    <span className={doc ? "text-slate-800 font-semibold" : "text-slate-400"}>
                      {doc
                        ? doc.name
                        : selectedHospId
                        ? "Selecione o médico"
                        : "Selecione o hospital primeiro"}
                    </span>
                    <ChevronDown size={14} className="text-slate-400 shrink-0 ml-2" />
                  </button>
                  {doctorOpen && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 max-h-60 overflow-y-auto no-scroll">
                      {docs.map((d) => (
                        <button
                          key={d.id}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors border-b border-slate-50 last:border-0"
                          onClick={(e) => { e.stopPropagation(); selectDoc(d.id); }}
                        >
                          <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-[11px] font-extrabold shrink-0">
                            {doctorInitials(d.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-800 leading-tight">{d.name}</div>
                            <div className="text-xs text-slate-500">{d.specialty} · {d.crm}</div>
                          </div>
                          <span
                            className={`shrink-0 self-center text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              d.availability.toLowerCase().includes("hoje")
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {d.availability}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date picker */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Data da Consulta
                  </label>
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => scrollDate("l")}
                      className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      <ChevronLeft size={13} className="text-slate-500" />
                    </button>
                    <button
                      onClick={() => scrollDate("r")}
                      className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      <ChevronRight size={13} className="text-slate-500" />
                    </button>
                  </div>
                </div>
                <div
                  ref={dateRef}
                  className="flex gap-2 overflow-x-auto pb-0.5 no-scroll"
                >
                  {days.map((day) => (
                    <button
                      key={day.key}
                      onClick={() => setSelectedDate(day.key)}
                      className={`flex flex-col items-center px-2.5 py-2 rounded-xl border min-w-[58px] shrink-0 transition-all ${
                        selectedDate === day.key
                          ? "bg-blue-700 border-blue-700 text-white shadow-md shadow-blue-200"
                          : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 bg-white"
                      }`}
                    >
                      <span className="text-[9px] font-extrabold uppercase tracking-wide opacity-80 leading-none">
                        {day.label}
                      </span>
                      <span className="text-xl font-extrabold leading-none my-1">{day.num}</span>
                      <span className="text-[9px] opacity-70 leading-none">{day.month}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time + Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-5">
                {/* Time slots */}
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                    Horário
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          selectedTime === slot
                            ? "bg-blue-700 border-blue-700 text-white shadow-sm"
                            : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 bg-white"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                    Pagamento
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 h-[calc(100%-24px)]">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedPayment(opt.id)}
                        className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                          selectedPayment === opt.id
                            ? "bg-blue-700 border-blue-700 text-white shadow-sm"
                            : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 bg-white"
                        }`}
                      >
                        <span className="text-lg leading-none">{opt.icon}</span>
                        <span className="text-center leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Book CTA */}
              <button
                onClick={() => canBook && setBooked(true)}
                className={`w-full py-3.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${
                  canBook
                    ? "bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Calendar size={16} />
                Confirmar Agendamento
                {canBook && <ArrowRight size={16} />}
              </button>
              {!canBook && (
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  Preencha todos os campos para continuar
                </p>
              )}
            </div>
          )}

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-x-7 gap-y-2 mt-8 pb-10">
            {[
              "🔒 Dados protegidos pela LGPD",
              "⭐ 4.9/5 — 200k+ avaliações",
              "🏥 500+ hospitais credenciados",
              "⚡ Confirmação em minutos",
            ].map((item) => (
              <span key={item} className="text-blue-100/75 text-xs font-medium">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
            {[
              { v: "12.400+", l: "Médicos cadastrados" },
              { v: "500+",    l: "Hospitais parceiros" },
              { v: "2,3M+",  l: "Consultas realizadas" },
              { v: "4.9 ★",  l: "Avaliação média" },
            ].map((s) => (
              <div key={s.l} className="text-center py-1 px-4">
                <div className="text-2xl font-extrabold text-blue-800 leading-none">{s.v}</div>
                <div className="text-xs font-medium text-slate-500 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOSPITALS FEED ────────────────────────────────────────────────── */}
      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-1">
              Onde você será atendido
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
              Hospitais Cadastrados
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Parceiros selecionados para garantir o melhor atendimento
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {HOSPITALS.map((h) => (
              <article
                key={h.id}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:border-blue-300 hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="relative h-44 bg-blue-100">
                  <img
                    src={`https://images.unsplash.com/${h.photoId}?w=500&h=220&fit=crop&auto=format`}
                    alt={h.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  {h.badge && (
                    <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                      {h.badge}
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <MapPin size={10} className="text-white" />
                      <span className="text-white text-[10px] font-medium">{h.city}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span className="text-white text-[10px] font-bold">{h.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-extrabold text-slate-800 text-sm mb-0.5 leading-tight">{h.name}</h3>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">{h.desc}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Building2 size={10} className="text-blue-500" />
                        {h.specialties} especialidades
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={10} className="text-amber-400" />
                        {h.reviews.toLocaleString("pt-BR")} avaliações
                      </span>
                    </div>
                    <span className="text-blue-600 font-semibold hover:underline">
                      Ver mais →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS MARQUEE ───────────────────────────────────────────────── */}
      <section className="py-14 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-1">
            Depoimentos Verificados
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
            O que nossos pacientes dizem
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Mais de 200.000 avaliações reais na plataforma
          </p>
        </div>

        <div className="marquee-wrap">
          <div className="marquee flex gap-4 w-max px-4">
            {[...REVIEWS, ...REVIEWS].map((r, i) => (
              <div
                key={i}
                className="bg-background border border-border rounded-2xl p-5 w-72 shrink-0 hover:border-blue-200 hover:bg-blue-50/40 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white text-[11px] font-extrabold shrink-0">
                    {r.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-800 leading-tight truncate">{r.name}</div>
                    <div className="text-[10px] text-slate-500">{r.role} · {r.date}</div>
                  </div>
                </div>
                <Stars rating={r.rating} size={12} />
                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">{r.text}</p>
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5">
                  <Building2 size={9} className="text-blue-500 shrink-0" />
                  <span className="text-[10px] text-slate-500 font-medium truncate">{r.hospital}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <About />

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart size={13} className="text-white fill-white" />
                </div>
                <span className="font-extrabold text-white text-sm">
                  Med<span className="text-blue-400">Agenda</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4 max-w-[200px]">
                A plataforma mais prática para agendamento médico e licença médica online no Brasil.
              </p>
              <div className="flex gap-2">
                {["Li", "Tw", "Ig", "Fb"].map((s) => (
                  <button
                    key={s}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-400 hover:bg-blue-700 hover:text-white transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {[
              { title: "Empresa",  links: ["Quem Somos", "Nossa Missão", "Carreiras", "Imprensa", "Blog"] },
              { title: "Serviços", links: ["Para Pacientes", "Para Médicos", "Para Hospitais", "Planos Corporativos", "API"] },
              { title: "Suporte",  links: ["Central de Ajuda", "Fale Conosco", "Política de Privacidade", "Termos de Uso", "LGPD"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href={link === "Quem Somos" ? "#quem-somos" : "#"} className="text-xs text-slate-500 hover:text-blue-400 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="brand-credit"><System32Brand /><p>Tecnologia que conecta você ao cuidado.</p></div><div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-[11px] text-slate-600">
              © {new Date().getFullYear()} MedAgenda · Desenvolvido por SYSTEM32.
            </span>
            <span className="text-[11px] text-slate-600">
              Projeto acadêmico · Demonstração
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}



