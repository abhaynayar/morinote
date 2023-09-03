import "./Square.css";

export default function Square(props: {
  className: string;
  onClick: () => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: () => void;
  "data-index"?: number;
}) {
  return (
    <div {...props} className={props.className} ></div>
  );
}
