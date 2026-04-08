import { redirect } from "next/navigation";

type PageProps = {
	searchParams?: Record<string, string | string[] | undefined>;
};

function toQueryString(searchParams: PageProps["searchParams"]) {
	if (!searchParams) return "";

	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(searchParams)) {
		if (typeof value === "string") {
			params.set(key, value);
		} else if (Array.isArray(value)) {
			for (const v of value) params.append(key, v);
		}
	}

	const qs = params.toString();
	return qs ? `?${qs}` : "";
}

export default function Page({ searchParams }: PageProps) {
	redirect(`/auth${toQueryString(searchParams)}`);
}
