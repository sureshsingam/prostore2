const ProductPrice = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const stringValue = value.toFixed(2);

  // get the dollars and cents
  const [dollarValue, centsValue] = stringValue.split(".");

  return (
    <>
      <p className={className ? className : "text-2xl"}>
        <span className="text-xs align-super"> $ </span>
        {dollarValue}
        <span className="text-xs align-super"> .{centsValue} </span>
      </p>
    </>
  );
};

export default ProductPrice;
