## Packages
(none needed)

## Notes
- LocalStorage is used to maintain session state (`garden_session`: { gardenCode, userId, role })
- Framer Motion is used heavily for the cottagecore feel (soft bounces, draggable elements)
- The Drawing Canvas uses standard HTML5 Canvas API and converts to base64 for storage
- Draggable flowers calculate their drop position relative to the main garden container
