const awaitAll = require("./../awaitAll");

describe("awaitAll", () => {
	it("should resolve with an array of all resolved promise values", async () => {
		const asyncFn = jest.fn();

		asyncFn.mockResolvedValueOnce("value1");
		asyncFn.mockResolvedValueOnce("value2");
		asyncFn.mockResolvedValueOnce("value3");

		const results = await awaitAll(asyncFn, 3);

		expect(results).toEqual(["value1", "value2", "value3"]);
		expect(asyncFn).toHaveBeenCalledTimes(3);
	});

	it("should resolve with an array of all resolved promise values even if some reject", async () => {
		const asyncFn = jest.fn();

		asyncFn.mockResolvedValueOnce("value1");
		asyncFn.mockRejectedValueOnce("error");
		asyncFn.mockResolvedValueOnce("value2");

		const results = await awaitAll(asyncFn, 3);

		expect(results).toEqual(["value1", "error", "value2"]);
		expect(asyncFn).toHaveBeenCalledTimes(3);
	});

	it("should resolve with an empty array if no promises are given", async () => {
		const asyncFn = jest.fn();

		const results = await awaitAll(asyncFn, 0);

		expect(results).toEqual([]);
		expect(asyncFn).toHaveBeenCalledTimes(0);
	});
});
