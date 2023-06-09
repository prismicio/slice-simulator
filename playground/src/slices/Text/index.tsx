import { Content, isFilled } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

import { Bounded } from "@/components/Bounded";
import { PrismicRichText } from "@/components/PrismicRichText";

export type TextProps = SliceComponentProps<Content.TextSlice>;

const Text = ({ slice }: TextProps): JSX.Element => {
	return (
		<Bounded as="section">
			{isFilled.richText(slice.primary.text) && (
				<div className="font-serif leading-relaxed md:text-xl md:leading-relaxed">
					<PrismicRichText field={slice.primary.text} />
				</div>
			)}
		</Bounded>
	);
};

export default Text;
