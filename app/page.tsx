import type { FC } from "react";

import { Gallery } from "@/components/Gallery";
import { getGallery } from "@/app/actions/gallery";

export const dynamic = "force-dynamic";

const Home: FC = async () => {
  const initialResult = await getGallery();
  return <Gallery initialResult={initialResult} />;
};

export default Home;
