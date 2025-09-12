const AdPlaceholder = ({
  size = "medium",
}: {
  size?: "small" | "medium" | "large";
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
    <div
      className={`${getDimensions()} bg-muted rounded-lg flex items-center justify-center border border-dashed border-border `}
    >
      <div className="text-center text-muted-foreground">
        <div className="text-lg font-medium mb-2">Advertisement</div>
        <div className="text-sm">Custom Size</div>
      </div>
    </div>
  );
};

export default AdPlaceholder;
