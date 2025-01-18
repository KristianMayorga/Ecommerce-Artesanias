const FeatureList = () => {
    const features = [
        { text: 'Explora nuestra colección de ', highlight: 'artesanías tradicionales' },
        { text: 'Productos hechos a mano por artesanos locales' },
        { text: 'Envíos a todo Colombia' },
    ];

    return (
        <ol className="text-[#8B5E3C] text-center sm:text-left space-y-4">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                    <span className="mt-1.5 h-3 w-3 rounded-full bg-[#8B5E3C]"></span>
                    <span>
            {feature.text}
                        {feature.highlight && (
                            <span className="font-semibold">{feature.highlight}</span>
                        )}
          </span>
                </li>
            ))}
        </ol>
    );
};

export default FeatureList;