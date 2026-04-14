import React from 'react';
import './Timeline.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faGraduationCap, faCalendarDays, faLocationDot, faLaptop } from '@fortawesome/free-solid-svg-icons';

// items: [{ id, title, subtitle, caption, period, description, bullets:[] }]
// variant: 'left' | 'alternate' | 'plain' | 'line-left'
const Timeline = ({ items = [], variant = 'alternate' }) => {
  if (!items || items.length === 0) {
    return <p className="text-gray-300">No entries yet. Add them in Admin.</p>;
  }

  const iconFor = (name) => {
    switch (name) {
      case 'briefcase':
        return faBriefcase;
      case 'graduation':
        return faGraduationCap;
      case 'calendar':
        return faCalendarDays;
      case 'location':
        return faLocationDot;
      case 'remote':
        return faLaptop;
      default:
        return faBriefcase;
    }
  };

  if (variant === 'plain') {
    return (
      <div>
        <ol className="space-y-8">
          {items.map((item, idx) => (
            <li key={item.id || idx}>
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {item.icon && (
                      <div className="timeline-icon">
                        <FontAwesomeIcon icon={iconFor(item.icon)} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold leading-snug text-text-color">{item.title}</h3>
                      {item.subtitle && (
                        <p className="text-sm md:text-base text-hint-color leading-snug">{item.subtitle}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meta row */}
                {Array.isArray(item.meta) && item.meta.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-6 text-sm text-hint-color">
                    {item.meta.map((m, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <FontAwesomeIcon icon={iconFor(m.icon)} className="opacity-90 text-accent-color" />
                        <span>{m.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Body */}
                {item.description && (
                  <p className="mt-3 text-sm md:text-base leading-relaxed text-text-color">{item.description}</p>
                )}

                {/* Bullet list */}
                {Array.isArray(item.bullets) && item.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2 list-disc pl-5 text-text-color">
                    {item.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // Minimal, left-aligned with axis + dots, no cards
  if (variant === 'line-left') {
    return (
      <div className="relative">
        <div className="timeline-axis left hidden md:block" />
        <ol className="space-y-8">
          {items.map((item, idx) => (
            <li key={item.id || idx} className="relative pl-12 md:pl-14 timeline-item">
              <span className="timeline-dot-ping timeline-dot-abs" />
              <span className="timeline-dot timeline-dot-abs" />
              <div>
                {/* Header */}
                <div className="flex items-start gap-3">
                  {item.icon && (
                    <div className="hidden">{/* icon suppressed in minimal header */}</div>
                  )}
                  <div className="text-left">
                    <h3 className="text-2xl font-bold leading-snug text-text-color text-left">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-sm md:text-base text-hint-color leading-snug text-left">{item.subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Meta: location left, dates right */}
                {(item.metaLeft || item.metaRight || (Array.isArray(item.meta) && item.meta.length>0)) && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-hint-color">
                      <FontAwesomeIcon icon={iconFor('location')} className="text-accent-color" />
                      <span>{item.metaLeft || (Array.isArray(item.meta) ? (item.meta.find(m=>m.icon==='location')?.text || '') : '')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-hint-color">
                      <FontAwesomeIcon icon={iconFor('calendar')} className="text-accent-color" />
                      <span>{item.metaRight || (Array.isArray(item.meta) ? (item.meta.find(m=>m.icon==='calendar')?.text || '') : '')}</span>
                    </div>
                  </div>
                )}

                {/* Body */}
                {item.description && (
                  <p className="mt-3 text-sm md:text-base leading-relaxed text-text-color text-left">{item.description}</p>
                )}

                {/* Bullet list */}
                {Array.isArray(item.bullets) && item.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2 list-disc pl-5 text-text-color text-left">
                    {item.bullets.map((b, i) => (
                      <li key={i} className="timeline-bullet">{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const axisClass = variant === 'left' ? 'timeline-axis right' : 'timeline-axis';
  return (
    <div className="relative">
      <div className={`${axisClass} hidden md:block`} />
      <ol className="space-y-10">
        {items.map((item, idx) => {
          const isLeft = variant === 'left' ? true : idx % 2 === 0;
          return (
            <li key={item.id || idx} className="relative">
              <div className={`md:grid md:grid-cols-2 md:gap-6 items-center`}>
                {/* Left/Right container */}
                <div className={`${isLeft ? 'md:col-start-1' : 'md:col-start-2'} md:pr-8 md:pl-8`}>
                  <div className="timeline-card bg-box-bg text-box-text rounded-xl shadow p-5 border border-gray-700/30 transition transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gray-600">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.icon && (
                          <div className="timeline-icon">
                            <FontAwesomeIcon icon={iconFor(item.icon)} />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold leading-snug">{item.title}</h3>
                          {item.subtitle && (
                            <p className="text-sm md:text-base text-hint-color leading-snug">{item.subtitle}</p>
                          )}
                          {item.caption && (
                            <p className="text-xs text-gray-500 mt-1">{item.caption}</p>
                          )}
                        </div>
                      </div>
                      {/* Hide period pill when meta contains calendar */}
                      {item.period && !Array.isArray(item.meta) && (
                        <span className="timeline-pill whitespace-nowrap">{item.period}</span>
                      )}
                    </div>

                    {/* Meta row */}
                    {Array.isArray(item.meta) && item.meta.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-6 text-sm text-hint-color">
                        {item.meta.map((m, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <FontAwesomeIcon icon={iconFor(m.icon)} className="opacity-90 text-accent-color" />
                            <span>{m.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Body */}
                    {item.description && (
                      <p className="mt-3 text-sm md:text-base leading-relaxed text-box-text">{item.description}</p>
                    )}

                    {/* Bullet list */}
                    {Array.isArray(item.bullets) && item.bullets.length > 0 && (
                      <ul className="mt-4 space-y-2 list-disc pl-5 text-box-text">
                        {item.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Dot connector */}
                <div className={`hidden md:flex justify-center ${isLeft ? 'md:col-start-2 md:order-first' : 'md:col-start-1'} relative`}>
                  <span className="timeline-dot-ping" />
                  <span className="timeline-dot" />
                  <span className={`timeline-connector ${isLeft ? 'from-left' : 'from-right'}`} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default Timeline;
