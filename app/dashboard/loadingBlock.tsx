import Spinner from "../spinner";

export default function LoadingBlock() {
  return (
    <div className="w-1/3 bg-slate-200 rounded-lg flex items-center justify-center">
      <Spinner />
    </div>
  );
}
