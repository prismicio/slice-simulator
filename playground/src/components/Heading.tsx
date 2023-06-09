import clsx from "clsx";

export const Heading = ({
	as: Comp = "h1",
	size = "4xl",
	children,
	className,
}: {
	as: JSX.ElementType;
	size: "xl" | "2xl" | "3xl" | "4xl";
	className?: string;
	children?: JSX.Element | JSX.Element[] | false;
}): JSX.Element => {
	return (
		<Comp
			className={clsx(
				"font-sans font-semibold tracking-tighter text-slate-800",
				size === "4xl" && "text-3xl md:text-4xl",
				size === "3xl" && "text-3xl",
				size === "2xl" && "text-2xl",
				size === "xl" && "text-xl",
				className,
			)}
		>
			{children}
		</Comp>
	);
};
