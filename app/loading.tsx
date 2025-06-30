import Image from "next/image";
import loader from "@/assets/loader.gif";

const LoadingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Image src={loader} alt="Loading Animation" width={150} height={150} />
      <p>Loading.....please wait</p>
    </div>
  );
};

export default LoadingPage;
