export async function GMClearValues(): Promise<void> {
	for (const key of await GM.listValues()) {
		await GM.deleteValue(key);
	}
}