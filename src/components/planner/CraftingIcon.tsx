const CraftingIcon: React.FC<React.HTMLAttributes<SVGElement>> = (props) => {
  return (
    <svg
      viewBox="0 0 78 78"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      width="30"
      height="30"
      {...props}
    >
      <path
        d="M1137.5 504.6a38.6 38.6 0 1 1 0 77.3 38.6 38.6 0 0 1 0-77.3Zm-7.7 16.1-6.2 4.3 29 41.5 6.2-4.4-29-41.4Zm10.3 37.3h-30v3.6h30V558Zm-18-31.9-10.2 7.1 10.2 14.5 10.1-7-10.1-14.6Zm19.4-13.6-10.1 7.1 10.1 14.5 10.2-7.1-10.2-14.5Z"
        fill="#ffd802"
        transform="translate(-1098.9 -504.6)"
      />
    </svg>
  );
};
export default CraftingIcon;
