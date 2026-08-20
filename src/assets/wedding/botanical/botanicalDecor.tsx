interface BotanicalDecorProps {
  variant?: 'hero' | 'section' | 'bottom'
}

const asset = (path: string) => `/assets/botanical/${path}`

export function BotanicalDecor({
  variant = 'hero',
}: BotanicalDecorProps) {
  if (variant === 'hero') {
    return (
      <div className="botanical-hero" aria-hidden="true">
        {/* Willow */}
        <img
          className="botanical-willow botanical-willow-left"
          src={asset('willow/willow-left.png')}
          alt=""
        />

        <img
          className="botanical-willow botanical-willow-right"
          src={asset('willow/willow-right.png')}
          alt=""
        />

        {/* Lotus */}
        <img
          className="botanical-lotus botanical-lotus-large"
          src={asset('lotus/Lotus-Large.png')}
          alt=""
        />

        <img
          className="botanical-lotus botanical-lotus-small"
          src={asset('lotus/Lotus-Small.png')}
          alt=""
        />

        {/* Leaves */}
        <img
          className="botanical-leaf botanical-leaf-left"
          src={asset('leaves/Leaf-Large.png')}
          alt=""
        />

        <img
          className="botanical-leaf botanical-leaf-right"
          src={asset('leaves/Leaf-Medium.png')}
          alt=""
        />

        {/* Petals */}
        <img
          className="botanical-petal botanical-petal-one"
          src={asset('petals/Petal-1.png')}
          alt=""
        />

        <img
          className="botanical-petal botanical-petal-two"
          src={asset('petals/Petal-2.png')}
          alt=""
        />

        <img
          className="botanical-petal botanical-petal-three"
          src={asset('petals/Petal-3.png')}
          alt=""
        />

        {/* Water */}
        <img
          className="botanical-drop botanical-drop-one"
          src={asset('water/drop-small.png')}
          alt=""
        />

        <img
          className="botanical-drop botanical-drop-two"
          src={asset('water/drop-medium.png')}
          alt=""
        />

        <img
          className="botanical-ripple"
          src={asset('water/ripple.png')}
          alt=""
        />
      </div>
    )
  }

  return (
    <div className={`botanical-decoration botanical-decoration-${variant}`} aria-hidden="true">
      <img
        src={asset('lotus/Lotus-Small.png')}
        alt=""
      />
      <img
        src={asset('leaves/Leaf-small.png')}
        alt=""
      />
    </div>
  )
}