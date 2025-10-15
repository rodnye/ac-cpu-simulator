import type { CacheRegister } from "../services/cache.service";

interface CacheCardProps {
  data: CacheRegister[];
}

export const CacheCard = ({ data }: CacheCardProps) => {
  return (
    <div className="flex flex-col">
      <ul className="flex flex-col">
        {data.map((line) => (
          <li className="flex flex-row justify-between">
            <span>{line.tag}</span>
            <span>{line.index}</span>
            <span>{line.word}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
