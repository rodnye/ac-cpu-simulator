interface ComputerElementProps {
  data: {
    tw_bg: string;
    label: string;
  };
}
export const ComputerElement = ({ data }) => {
  return (
    <div
      className={
        "px-6 py-3 text-white font-bold text-center rounded-xl " + data.tw_bg
      }
    >
      {data.label}
    </div>
  );
};
