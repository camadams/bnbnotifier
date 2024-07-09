import Image from "next/image";

export default function Home() {
  return (
    // <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <div className="relative px-10">
      <div className="bg-red-400 h-screen -z-10">
        <Image
          className="bg-yellow-100 object-top object-cover"
          alt="hi"
          src={"/hero.svg"}
          fill
        />
      </div>
      <div className="bg-white/95 h-screen absolute inset-0 -z-9"></div>
      <div className=" h-screen absolute inset-0 ">
        <nav>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </nav>
      </div>
    </div>
  );
}
