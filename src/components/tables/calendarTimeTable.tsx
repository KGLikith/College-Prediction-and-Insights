export function CalendarTimeline({ items }: {
  items: { number: string; event: string; date: string }[]
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-neutral-900 dark:bg-neutral-50" />
            {index !== items.length - 1 && (
              <div className="w-px flex-1 bg-neutral-300 dark:bg-neutral-700" />
            )}
          </div>

          <div className="flex-1 pb-4">
            <p className="text-xs text-neutral-500">
              Event {item.number}
            </p>
            <p className="font-medium text-neutral-900 dark:text-neutral-50">
              {item.event}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {item.date}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
