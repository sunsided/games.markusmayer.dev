/** "2 November 2026": dates the way a label in a museum would write them. */
export function releaseDate(iso: string) {
	return new Date(iso).toLocaleDateString('en-GB', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC'
	});
}
