import { Calendar, Code2, HeartHandshake } from 'lucide-react';
import { System32Brand } from './System32Brand';

export function About() {
  return (
    <section id="quem-somos" aria-labelledby="about-title" className="about-section">
      <div className="about-grid">
        <div>
          <p className="about-eyebrow">QUEM SOMOS</p>
          <h2 id="about-title">Tecnologia para aproximar<br /><span>pessoas e cuidado.</span></h2>
          <p className="about-intro">O Medisys é um projeto de agendamento de consultas desenvolvido pela SYSTEM32. Nossa proposta é organizar consultas, exames e informações de uma clínica, respeitando as responsabilidades de pacientes, atendentes, médicos e administradores.</p>
          <p className="about-copy">Somos uma equipe acadêmica de desenvolvimento de software. Com este projeto, colocamos em prática o que aprendemos para construir soluções voltadas às necessidades das pessoas.</p>
          <a className="about-cta" href="#como-funciona">Conheça a proposta <span aria-hidden="true">↗</span></a>
        </div>
        <div className="about-brand-panel">
          <System32Brand />
          <p className="about-panel-title">Sistemas que transformam negócios.</p>
          <p className="about-panel-copy">A SYSTEM32 é a software house responsável pelo desenvolvimento e pela identidade tecnológica do Medisys.</p>
          <span className="about-project-label">PROJETO ACADÊMICO</span>
        </div>
      </div>
      <div className="about-values">
        {[
          { icon: Calendar, title: 'Simplicidade', text: 'Apresentar informações e etapas da rotina da clínica de forma organizada.' },
          { icon: HeartHandshake, title: 'Foco nas pessoas', text: 'Priorizar informações claras e uma navegação fácil de entender.' },
          { icon: Code2, title: 'Aprendizado e evolução', text: 'Aplicar conhecimentos de software e melhorar o projeto a partir de novos aprendizados.' },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title}><Icon size={23} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>
        ))}
      </div>
    </section>
  );
}

