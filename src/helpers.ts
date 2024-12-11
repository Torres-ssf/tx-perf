type MeasureResponse<T> = { response: T; duration: number };

export async function measure<T>(operation: () => Promise<T>): Promise<MeasureResponse<T>> {
  const startTime = Date.now();
  const response = await operation();
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  return { duration, response };
}
