const AdPlaceholder = ({
  size = "large",
  imageUrl,
  linkUrl,
}: {
  size?: "small" | "medium" | "large";
  imageUrl: string;
  linkUrl: string;
}) => {
  const getDimensions = () => {
    switch (size) {
      case "small":
        return "w-48 h-64"; // narrow and medium height
      case "large":
        return "w-60 h-[28rem]"; // taller ad, smaller width
      default: // medium
        return "w-56 h-80"; // balanced
    }
  };

  return (
    <a
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${getDimensions()} block`}
    >
      <div
        className={`bg-muted rounded-lg flex items-center justify-center border border-dashed border-border overflow-hidden`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Advertisement"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-muted-foreground">
            <div className="text-lg font-medium mb-2">Advertisement</div>
            <div className="text-sm">Custom Size</div>
          </div>
        )}
      </div>
    </a>
  );
};

export default AdPlaceholder;
