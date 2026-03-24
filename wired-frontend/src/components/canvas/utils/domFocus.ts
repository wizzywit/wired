/** True when the user is typing in a field (don’t steal Delete/Space/etc.). */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return true
  return target.closest('[contenteditable="true"]') != null
}
