document.addEventListener("DOMContentLoaded", () => {
	const connectButton = document.getElementById("connect");
	const dataContainer = document.getElementById("dataContainer");
	const ReversedString = document.getElementById("reversed");

	connectButton.addEventListener("click", initSerial);

	async function initSerial() {
		try {
			// Request serial port access
			const port = await navigator.serial.requestPort();

			// Open the port with a specific baud rate
			await port.open({ baudRate: 9600 });

			// Get a writer to send data to the serial port
			const writer = port.writable.getWriter();

			// Send a hex message to the serial port
			let hexMessage = "001600004447432D32303230";
			if (ReversedString.checked) {
				hexMessage = reverseString(hexMessage);
			}

			const byteArray = hexStringToByteArray(hexMessage);
			await writer.write(new Uint8Array(byteArray));

			// Get a reader to receive data from the serial port
			const reader = port.readable.getReader();
			const { value, done } = await reader.read();

			if (!done) {
				// Convert the received hex data to ASCII characters
				const receivedASCII = hexStringToASCII(byteArrayToHexString(value));
				dataContainer.textContent = "Received: " + receivedASCII;
			}

			// Close the writer and reader
			writer.releaseLock();
			reader.releaseLock();

			// Close the serial port when done
			await port.close();
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	// Helper function to convert a hex string to a byte array
	function hexStringToByteArray(hexString) {
		const bytes = [];
		for (let i = 0; i < hexString.length; i += 2) {
			bytes.push(parseInt(hexString.substr(i, 2), 16));
		}
		return bytes;
	}

	// Helper function to convert a byte array to a hex string
	function byteArrayToHexString(byteArray) {
		return Array.from(byteArray, (byte) =>
			byte.toString(16).padStart(2, "0")
		).join("");
	}

	// Helper function to convert a hex string to ASCII characters
	function hexStringToASCII(hexString) {
		let result = "";
		for (let i = 0; i < hexString.length; i += 2) {
			const hexCharCode = parseInt(hexString.substr(i, 2), 16);
			result += String.fromCharCode(hexCharCode);
		}
		return result;
	}

	function reverseString(str) {
		let reversed = "";
		for (let i = 0; i < str.length; i += 2) {
			const elem = str.substr(i, 2);
			reversed = elem + reversed;
		}
		return reversed;
	}
});
