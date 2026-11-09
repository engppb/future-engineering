import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import ServiceVisual from './ServiceVisual'
import { servicePanels } from './servicePanels'

const WHATSAPP_NUMBER = '5581981448976'

function ServicePanel({ service, index, active }) {
  const detailId = `detalhes-${service.slug}`
  const isFleetService = service.slug === 'inspecao-frotas'
  const serviceInquiryLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(service.whatsappMessage)}`

  return (
    <section
      className={`experience-panel service-panel${active ? ' is-active' : ''}${isFleetService ? ' service-panel-featured' : ''}`}
      id={`area-${service.slug}`}
      aria-labelledby={`panel-title-${service.slug}`}
      aria-hidden={!active}
      inert={!active}
    >
      <div className="panel-atmosphere" aria-hidden="true" />
      <div className="panel-content service-panel-content">
        <ServiceVisual
          index={index}
          panelNumber={index + 2}
          title={service.title}
          active={active}
        />
        <div className="service-panel-copy panel-copy-scroll">
          <p className="service-label panel-kicker">
            <span>{String(index + 2).padStart(2, '0')}</span>
            <span className="service-label-rule" aria-hidden="true" />
            {service.label}
          </p>
          <h2 id={`panel-title-${service.slug}`}>{service.title}</h2>
          <p className="service-description">{service.description}</p>
          {isFleetService && (
            <p className="service-audience">
              SOLUÇÕES PARA SETOR PRIVADO E GESTÃO PÚBLICA
            </p>
          )}
          <a
            className="service-button"
            href={serviceInquiryLink}
            target="_blank"
            rel="noopener noreferrer"
          >
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
      </div>
    </section>
  )
}

export default function ServiceAreas({ activeIndex }) {
  return servicePanels.map((service, index) => (
    <ServicePanel
      key={service.slug}
      service={service}
      index={index === 3 ? 4 : index}
      active={activeIndex === index + 1}
    />
  ))
}
