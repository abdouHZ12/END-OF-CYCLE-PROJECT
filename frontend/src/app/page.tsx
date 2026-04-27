import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

function toQueryString(searchParams?: SearchParams) {
	if (!searchParams) return "";

	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(searchParams)) {
		if (typeof value === "string") {
			params.set(key, value);
		} else if (Array.isArray(value)) {
			value.forEach((v) => params.append(key, v));
		}
	}

	const qs = params.toString();
	return qs ? `?${qs}` : "";
}

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const resolved = await searchParams;

	redirect(`/auth${toQueryString(resolved)}`);
}