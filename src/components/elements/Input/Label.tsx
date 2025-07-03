interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}

const Label: React.FC<LabelProps> = ({
  htmlFor,
  className = `absolute left-2 -top-2 bg-white px-1 text-xs text-gray-500
        transition-all duration-200 ease-in-out
        peer-placeholder-shown:top-3 peer-placeholder-shown:left-3
        peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
        peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs
        peer-focus:text-blue-600 peer-focus:font-medium`,
  children,
}) => {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  );
};

export default Label;
