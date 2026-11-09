import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import ServiceVisual from './ServiceVisual'

const services = [
  {
    slug: 'engenharia-manutencao',
    title: 'Engenharia e Manutenção',
    label: 'CONFIABILIDADE DE ATIVOS',
    description:
      'Estruture a manutenção para cuidar dos ativos, antecipar desvios e dar mais previsibilidade à operação.',
    scope:
      'Organização técnica para uma rotina de manutenção mais consistente.',
    points: [
      'Manutenção de máquinas e equipamentos',
      'Planejamento de manutenção',
      'Análise de falhas e indicadores',
      'Confiabilidade operacional',
    ],
  },
  {
    slug: 'gestao-operacional',
    title: 'Gestão Operacional',
    label: 'EFICIÊNCIA NA OPERAÇÃO',
    description:
      'Apoio ao planejamento de equipes e recursos, com acompanhamento de desempenho e produtividade.',
    scope:
      'Visibilidade operacional para organizar recursos e apoiar decisões.',
    points: [
      'Planejamento e acompanhamento de equipes',
      'Indicadores de produtividade',
      'Gestão de recursos operacionais',
      'Análise de desempenho',
    ],
  },
  {
    slug: 'seguranca-trabalho',
    title: 'Segurança do Trabalho',
    label: 'PREVENÇÃO E ORGANIZAÇÃO',
    description:
      'Suporte preventivo para identificar riscos e organizar processos e documentação relacionados à segurança.',
    scope:
      'Apoio à prevenção e aos processos internos de segurança do trabalho.',
    points: [
      'Identificação de riscos',
      'Gestão preventiva',
      'Organização de documentação',
      'Apoio aos processos de segurança',
    ],
  },
  {
    slug: 'processos-melhoria',
    title: 'Processos e Melhoria Contínua',
    label: 'PROCESSOS MAIS CLAROS',
    description:
      'Mapeie o trabalho como ele acontece, localize gargalos e estabeleça padrões para evoluir os resultados.',
    scope:
      'Análise estruturada de processos para orientar melhorias operacionais.',
    points: [
      'Mapeamento de processos',
      'Identificação de gargalos',
      'Padronização operacional',
      'Análise e melhoria de resultados',
    ],
  },
  {
    slug: 'inspecao-frotas',
    title: 'Inspeção Técnica e Gestão de Frotas',
    label: 'GESTÃO E ACOMPANHAMENTO DE FROTAS',
    description:
      'Apoio à organização e fiscalização de frotas de empresas, prefeituras, secretarias municipais e instituições.',
    scope:
      'Rotinas visuais e documentais para apoiar o acompanhamento de veículos e da manutenção.',
    points: [
      'Vistorias visuais de veículos',
      'Checklists de inspeção',
      'Registro fotográfico de avarias',
      'Relatórios de não conformidades',
      'Controle de quilometragem',
      'Acompanhamento de manutenção preventiva',
      'Apoio à gestão e fiscalização de frotas',
    ],
  },
]

function ServiceItem({ service, index }) {
  const detailId = `detalhes-${service.slug}`
  const isFleetService = index === 4

  return (
    <article
      className={`service-panel${isFleetService ? ' service-panel-featured' : ''}`}
      id={`area-${service.slug}`}
    >
      <ServiceVisual index={index} title={service.title} />
      <div className="service-panel-copy">
        <p className="service-label">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span className="service-label-rule" aria-hidden="true" />
          {service.label}
        </p>
        <h3>{service.title}</h3>
        <p className="service-description">{service.description}</p>
        {isFleetService && (
          <p className="service-audience">
            SOLUÇÕES PARA SETOR PRIVADO E GESTÃO PÚBLICA
          </p>
        )}
        <a className="service-button" href={`#${detailId}`}>
          <span>CONHECER SERVIÇO</span>
          <ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" />
        </a>
        <div className="service-detail" id={detailId}>
          <p className="service-detail-label">
            <ArrowDownRight size={14} strokeWidth={1.5} aria-hidden="true" />
            ESCOPO DE ATUAÇÃO
          </p>
          <p className="service-detail-intro">{service.scope}</p>
          <ul>
            {service.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          {isFleetService && (
            <p className="fleet-disclaimer">
              As atividades descritas são de apoio técnico e gestão operacional.
              Não representam laudo oficial ou inspeção regulamentada.
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default function ServiceAreas() {
  return (
    <section
      className="approach-section"
      id="especialidades"
      aria-labelledby="approach-title"
    >
      <div className="approach-content">
        <header className="approach-intro">
          <p className="approach-eyebrow">
            <span className="eyebrow-line" aria-hidden="true" />
            ÁREAS DE ATUAÇÃO
          </p>
          <h2 id="approach-title">
            ENGENHARIA APLICADA
            <br />
            À REALIDADE DA OPERAÇÃO.
          </h2>
          <p className="approach-description">
            Consultoria técnica para operações mais organizadas, processos mais
            claros e ativos acompanhados com critério.
          </p>
          <nav className="service-index" aria-label="Navegar por áreas de atuação">
            {services.map((service, index) => (
              <a key={service.slug} href={`#area-${service.slug}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span>{service.title}</span>
                <ArrowDownRight size={14} aria-hidden="true" />
              </a>
            ))}
          </nav>
        </header>
        <div className="service-list">
          {services.map((service, index) => (
            <ServiceItem
              key={service.slug}
              service={service}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
