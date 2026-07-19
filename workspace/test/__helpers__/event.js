export const simulateEvent = function(element, eventName) {
	const ownerDocument = element.nodeType === 9 ? element : (element.ownerDocument || document);
	const event = ownerDocument.createEvent("Event");
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
};

export default {
    simulateEvent
};
