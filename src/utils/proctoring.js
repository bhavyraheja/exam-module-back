const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");
const Media = require("../models/Proctoring");

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();
const userStreams = new Map();

const initSocket = (server) => {
  const io = socketIo(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`✅ Socket Connected: ${socket.id}`);

    // 📡 Room Join
    socket.on("room:join", async ({ email, room, courseId, userId }) => {
      emailToSocketIdMap.set(email, socket.id);
      socketIdToEmailMap.set(socket.id, email);

      socket.join(room);
      io.to(room).emit("user:joined", { email, id: socket.id });
      io.to(socket.id).emit("room:join", { email, room });
      console.log(`📡 User joined room: ${email}`);
    });

    // 🎥 Start Streaming
    socket.on("start-streaming", () => {
      const email = socketIdToEmailMap.get(socket.id);
      if (!email) return;

      const directoryPath = path.join(__dirname, "../uploads");
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      const filename = `${email}_${Date.now()}.webm`;
      const filepath = path.join(directoryPath, filename);
      const writeStream = fs.createWriteStream(filepath);

      userStreams.set(socket.id, {
        writeStream,
        filepath,
      });

      console.log(`🎥 Stream started for user: ${email}`);
    });

    // 🎥 Receive Video Chunk
    socket.on("video-chunk", (chunk) => {
      const userStream = userStreams.get(socket.id);
      if (userStream) {
        userStream.writeStream.write(chunk);
      }
    });

    // 🛑 End Streaming & Save to DB
    socket.on("end-streaming", async ({ userId, courseId, chapterId }) => {
      const userStream = userStreams.get(socket.id);
      if (!userStream) return;

      // 🛑 Stop Writing & Save File
      userStream.writeStream.end();
      const { filepath } = userStream;

      // 🕒 Wait for file to close before saving to DB
      userStream.writeStream.on("finish", async () => {
        console.log(`✅ Stream saved at: ${filepath}`);

        // Save media information to DB
        const media = new Media({
          userId,
          courseId,
          chapterId,
          mediaUrl: `/uploads/${path.basename(filepath)}`,
          mediaType: "VIDEO",
        });

        await media.save();
        console.log(`📡 Media saved for user: ${socketIdToEmailMap.get(socket.id)}`);
      });

      userStreams.delete(socket.id);
    });

    // ❌ Handle Disconnect
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      userStreams.delete(socket.id);
      socketIdToEmailMap.delete(socket.id);
    });
  });
};

module.exports = initSocket;














// const socketIo = require("socket.io");
// const fs = require("fs");
// const path = require("path");
// const Media = require("../models/Proctoring");

// const emailToSocketIdMap = new Map();
// const socketIdToEmailMap = new Map();
// const userStreams = new Map();

// const initSocket = (server) => {
//   const io = socketIo(server, {
//     cors: { origin: "*" },
//   });

//   io.on("connection", (socket) => {
//     console.log(`✅ Socket Connected: ${socket.id}`);

//     // 📡 Room Join
//     socket.on("room:join", async ({ email, room, courseId, userId }) => {
//       emailToSocketIdMap.set(email, socket.id);
//       socketIdToEmailMap.set(socket.id, email);

//       socket.join(room);
//       io.to(room).emit("user:joined", { email, id: socket.id });
//       io.to(socket.id).emit("room:join", { email, room });
//       console.log(`📡 User joined room: ${email}`);
//     });

//     // 🎥 Start Streaming (Camera + Screen)
//     socket.on("start-streaming", ({ screen }) => {
//       const email = socketIdToEmailMap.get(socket.id);
//       if (!email) return;

//       const directoryPath = path.join(__dirname, "../uploads");
//       if (!fs.existsSync(directoryPath)) {
//         fs.mkdirSync(directoryPath, { recursive: true });
//       }

//       const filename = `${email}_${Date.now()}.webm`;
//       const filepath = path.join(directoryPath, filename);
//       const writeStream = fs.createWriteStream(filepath);

//       userStreams.set(socket.id, {
//         writeStream,
//         filepath,
//         screen, // Store screen info if needed
//       });

//       console.log(`🎥 Stream started for user: ${email}`);
//     });

//     // 🎥 Receive Video Chunk (Camera + Screen)
//     socket.on("video-chunk", (chunk) => {
//       const userStream = userStreams.get(socket.id);
//       if (userStream) {
//         userStream.writeStream.write(chunk);
//       }
//     });

//     // 🛑 End Streaming & Save to DB
//     socket.on("end-streaming", async ({ userId, courseId, chapterId }) => {
//       const userStream = userStreams.get(socket.id);
//       if (!userStream) return;

//       // 🛑 Stop Writing & Save File
//       userStream.writeStream.end();
//       const { filepath } = userStream;

//       // 🕒 Wait for file to close before saving to DB
//       userStream.writeStream.on("finish", async () => {
//         console.log(`✅ Stream saved at: ${filepath}`);

//         // Save media information to DB
//         const media = new Media({
//           userId,
//           courseId,
//           chapterId,
//           mediaUrl: `/uploads/${path.basename(filepath)}`,
//           mediaType: "VIDEO",
//         });

//         await media.save();
//         console.log(`📡 Media saved for user: ${socketIdToEmailMap.get(socket.id)}`);
//       });

//       userStreams.delete(socket.id);
//     });

//     // ❌ Handle Disconnect
//     socket.on("disconnect", () => {
//       console.log(`❌ User disconnected: ${socket.id}`);
//       userStreams.delete(socket.id);
//       socketIdToEmailMap.delete(socket.id);
//     });
//   });
// };

// module.exports = initSocket;

