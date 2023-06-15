import { Content, isFilled } from "@prismicio/client";
import { PrismicText, SliceComponentProps } from "@prismicio/react";

import { Bounded } from "@/components/Bounded";

export type QuoteProps = SliceComponentProps<Content.QuoteSlice>;

const Quote = ({ slice }: QuoteProps): JSX.Element => {
	return (
		<Bounded as="section" size="wide">
			{isFilled.richText(slice.primary.quote) && (
				<div className="font-serif text-3xl italic leading-relaxed">
					&ldquo;
					<PrismicText field={slice.primary.quote} />
					&rdquo;
					{isFilled.keyText(slice.primary.source) && (
						<> &mdash; {slice.primary.source}</>
					)}
				</div>
			)}
		</Bounded>
	);
};

export default Quote;
