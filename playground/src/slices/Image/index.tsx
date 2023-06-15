import { Content, isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { SliceComponentProps } from "@prismicio/react";

import { Bounded } from "@/components/Bounded";
import { PrismicRichText } from "@/components/PrismicRichText";

export type ImageProps = SliceComponentProps<Content.ImageSlice>;

const Image = ({ slice }: ImageProps): JSX.Element => {
	const image = slice.primary.image;

	return (
		<Bounded as="section" size={slice.variation === "wide" ? "widest" : "base"}>
			<figure className="grid grid-cols-1 gap-4">
				{isFilled.image(image) && (
					<div className="bg-gray-100">
						<PrismicNextImage field={image} sizes="100vw" className="w-full" />
					</div>
				)}
				{isFilled.richText(slice.primary.caption) && (
					<figcaption className="text-center font-serif italic tracking-tight text-slate-500">
						<PrismicRichText field={slice.primary.caption} />
					</figcaption>
				)}
			</figure>
		</Bounded>
	);
};

export default Image;
