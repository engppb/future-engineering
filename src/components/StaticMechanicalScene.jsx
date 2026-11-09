function createGearPath(cx, cy, radius, rootRadius, teeth) {
  const commands = []

  for (let tooth = 0; tooth < teeth; tooth += 1) {
    const baseAngle = (tooth / teeth) * Math.PI * 2
    const points = [
      [-0.5, rootRadius],
      [-0.31, rootRadius],
      [-0.23, radius],
      [0.23, radius],
      [0.31, rootRadius],
      [0.5, rootRadius],
    ]

    points.forEach(([fraction, pointRadius], index) => {
      const angle = baseAngle + (fraction / teeth) * Math.PI * 2
      const x = cx + Math.cos(angle) * pointRadius
      const y = cy + Math.sin(angle) * pointRadius
      commands.push(`${tooth === 0 && index === 0 ? 'M' : 'L'}${x} ${y}`)
    })
  }

  return `${commands.join(' ')} Z`
}

function StaticGear({ cx, cy, radius, rootRadius, teeth, id }) {
  const path = createGearPath(cx, cy, radius, rootRadius, teeth)
  const hubRadius = radius * 0.23

  return (
    <g>
      <path
        d={path}
        fill={`url(#${id}-steel)`}
        stroke="#a8b5bd"
        strokeWidth="2"
        filter="url(#gear-shadow)"
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius * 0.57}
        fill="none"
        stroke="#aebac0"
        strokeWidth="7"
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius * 0.5}
        fill="none"
        stroke="#3d4b54"
        strokeWidth="5"
      />
      <circle
        cx={cx}
        cy={cy}
        r={hubRadius * 1.28}
        fill="#121a20"
        stroke="#bcc7cb"
        strokeWidth="7"
      />
      <circle
        cx={cx}
        cy={cy}
        r={hubRadius * 0.66}
        fill="#45535d"
        stroke="#85939a"
        strokeWidth="3"
      />
      <circle cx={cx} cy={cy} r={hubRadius * 0.24} fill="#d0a641" />
    </g>
  )
}

export default function StaticMechanicalScene() {
  return (
    <svg
      className="scene-fallback"
      viewBox="0 0 760 640"
      role="img"
      aria-label="Engrenagens metálicas e conjunto de rolamentos"
    >
      <defs>
        <linearGradient id="large-steel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4dce0" />
          <stop offset="32%" stopColor="#7d8b94" />
          <stop offset="58%" stopColor="#46545e" />
          <stop offset="82%" stopColor="#a4b0b6" />
          <stop offset="100%" stopColor="#37444c" />
        </linearGradient>
        <linearGradient id="small-steel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c0cbd0" />
          <stop offset="38%" stopColor="#586771" />
          <stop offset="72%" stopColor="#a1adb3" />
          <stop offset="100%" stopColor="#3c4951" />
        </linearGradient>
        <filter id="gear-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="11" />
          <feOffset dx="0" dy="13" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g opacity="0.6" stroke="#415361" strokeWidth="8">
        <path d="M92 150H662" />
        <path d="M104 510H617" />
        <path d="M145 150V510" />
        <path d="M616 150V510" />
      </g>
      <g fill="#20303a" stroke="#71808a" strokeWidth="5">
        <circle cx="145" cy="150" r="13" />
        <circle cx="616" cy="150" r="13" />
        <circle cx="145" cy="510" r="13" />
        <circle cx="616" cy="510" r="13" />
      </g>
      <StaticGear
        cx={278}
        cy={293}
        radius={205}
        rootRadius={166}
        teeth={18}
        id="large"
      />
      <StaticGear
        cx={493}
        cy={406}
        radius={143}
        rootRadius={113}
        teeth={12}
        id="small"
      />
    </svg>
  )
}
