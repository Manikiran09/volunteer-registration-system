const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const JSON_FILE_PATH = path.join(__dirname, 'local_db.json');
let isFallback = false;

// Initialize JSON database if needed
const initJsonDb = () => {
  if (!fs.existsSync(JSON_FILE_PATH)) {
    const initialData = {
      users: [
        // Default admin user for immediate testing: password is 'admin123'
        // hashed value: $2a$10$WpP9D36TqY7N10w4yU4HauFm.0Yg0m2tE6u5T/uQ1yY95GgQ11X5G
        // Let's create it with an easy password or hash it during server startup if empty
        {
          _id: "admin-default-id",
          name: "System Admin",
          email: "admin@volunteer.com",
          password: "$2a$10$v.pde8S3/KjvKb07u6wnKOfcDmH2XfwBUW/5sfihxTxkQt69eR2uG", // hash for 'admin123'
          role: "admin",
          skills: ["Management", "Leadership"],
          availability: ["weekdays", "weekends"],
          status: "approved",
          registeredEvents: [],
          bio: "Default administrator account.",
          hoursLogged: 0,
          createdAt: new Date().toISOString()
        }
      ],
      events: [
        {
          _id: "event-1",
          title: "Community Food Drive",
          description: "Help organize, sort, and distribute food items to families in need within the local community.",
          date: "2026-07-10",
          location: "Downtown Civic Center",
          skillsRequired: ["Organization", "Logistics", "Food Service"],
          slots: 15,
          registeredVolunteers: [],
          status: "upcoming",
          createdAt: new Date().toISOString()
        },
        {
          _id: "event-2",
          title: "Tech Support for Seniors",
          description: "Assist elderly community members with smartphones, laptops, and accessing online government/health portals.",
          date: "2026-07-18",
          location: "Greenwood Retirement Village",
          skillsRequired: ["Technical Support", "Communication", "Teaching"],
          slots: 8,
          registeredVolunteers: [],
          status: "upcoming",
          createdAt: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf8');
  }
};

// Mongoose Schemas (used if MongoDB is connected)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['volunteer', 'admin'], default: 'volunteer' },
  skills: [String],
  availability: [String], // weekdays, weekends, evenings, etc.
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  bio: String,
  hoursLogged: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  location: { type: String, required: true },
  skillsRequired: [String],
  slots: { type: Number, default: 10 },
  registeredVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
  createdAt: { type: Date, default: Date.now }
});

let UserModel;
let EventModel;

// Connect to DB (Mongo or Fallback to JSON file)
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === '') {
    console.log('⚠️  No MONGODB_URI environment variable detected. Falling back to local JSON database storage.');
    isFallback = true;
    initJsonDb();
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB successfully.');
    UserModel = mongoose.model('User', UserSchema);
    EventModel = mongoose.model('Event', EventSchema);
    
    // Seed default admin in Mongo if empty
    const adminCount = await UserModel.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      await UserModel.create({
        name: "System Admin",
        email: "admin@volunteer.com",
        password: "$2a$10$v.pde8S3/KjvKb07u6wnKOfcDmH2XfwBUW/5sfihxTxkQt69eR2uG", // hash for 'admin123'
        role: "admin",
        skills: ["Management", "Leadership"],
        availability: ["weekdays", "weekends"],
        status: "approved",
        registeredEvents: [],
        bio: "Default administrator account.",
        hoursLogged: 0
      });
      console.log('✨ Seeded default admin account in MongoDB.');
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Falling back to local JSON database storage.');
    isFallback = true;
    initJsonDb();
  }
};

// JSON Local DB CRUD helpers
const readJson = () => {
  initJsonDb();
  const raw = fs.readFileSync(JSON_FILE_PATH, 'utf8');
  return JSON.parse(raw);
};

const writeJson = (data) => {
  fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
};

const db = {
  isFallback: () => isFallback,
  connect: connectDB,
  
  users: {
    find: async (query = {}) => {
      if (!isFallback) {
        return await UserModel.find(query).populate('registeredEvents');
      }
      
      const data = readJson();
      return data.users.filter(u => {
        for (let key in query) {
          if (Array.isArray(query[key])) {
            if (!query[key].every(val => u[key] && u[key].includes(val))) return false;
          } else if (u[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
    },

    findOne: async (query = {}) => {
      if (!isFallback) {
        return await UserModel.findOne(query).populate('registeredEvents');
      }
      
      const data = readJson();
      const user = data.users.find(u => {
        for (let key in query) {
          if (u[key] !== query[key]) return false;
        }
        return true;
      });
      return user || null;
    },

    findById: async (id) => {
      if (!isFallback) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await UserModel.findById(id).populate('registeredEvents');
      }
      
      const data = readJson();
      const user = data.users.find(u => u._id === id);
      if (user) {
        // Resolve registeredEvents
        user.registeredEvents = user.registeredEvents.map(eventId => 
          data.events.find(e => e._id === eventId) || eventId
        );
      }
      return user || null;
    },

    create: async (userData) => {
      if (!isFallback) {
        return await UserModel.create(userData);
      }

      const data = readJson();
      const newUser = {
        _id: 'user_' + Math.random().toString(36).substr(2, 9),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'volunteer',
        skills: userData.skills || [],
        availability: userData.availability || [],
        status: userData.status || 'pending',
        registeredEvents: userData.registeredEvents || [],
        bio: userData.bio || '',
        hoursLogged: userData.hoursLogged || 0,
        createdAt: new Date().toISOString()
      };
      data.users.push(newUser);
      writeJson(data);
      return newUser;
    },

    findByIdAndUpdate: async (id, updateData) => {
      if (!isFallback) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
      }

      const data = readJson();
      const idx = data.users.findIndex(u => u._id === id);
      if (idx === -1) return null;

      // Extract only updating fields, ignoring _id
      const { _id, ...safeUpdates } = updateData;
      data.users[idx] = { ...data.users[idx], ...safeUpdates };
      writeJson(data);
      return data.users[idx];
    }
  },

  events: {
    find: async (query = {}) => {
      if (!isFallback) {
        return await EventModel.find(query).populate('registeredVolunteers');
      }
      
      const data = readJson();
      return data.events.filter(e => {
        for (let key in query) {
          if (e[key] !== query[key]) return false;
        }
        return true;
      });
    },

    findById: async (id) => {
      if (!isFallback) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await EventModel.findById(id).populate('registeredVolunteers');
      }
      
      const data = readJson();
      const event = data.events.find(e => e._id === id);
      if (event) {
        // Resolve registeredVolunteers
        event.registeredVolunteers = event.registeredVolunteers.map(volId => 
          data.users.find(u => u._id === volId) || volId
        );
      }
      return event || null;
    },

    create: async (eventData) => {
      if (!isFallback) {
        return await EventModel.create(eventData);
      }

      const data = readJson();
      const newEvent = {
        _id: 'event_' + Math.random().toString(36).substr(2, 9),
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        skillsRequired: eventData.skillsRequired || [],
        slots: eventData.slots || 10,
        registeredVolunteers: [],
        status: eventData.status || 'upcoming',
        createdAt: new Date().toISOString()
      };
      data.events.push(newEvent);
      writeJson(data);
      return newEvent;
    },

    findByIdAndUpdate: async (id, updateData) => {
      if (!isFallback) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await EventModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
      }

      const data = readJson();
      const idx = data.events.findIndex(e => e._id === id);
      if (idx === -1) return null;

      const { _id, ...safeUpdates } = updateData;
      data.events[idx] = { ...data.events[idx], ...safeUpdates };
      writeJson(data);
      return data.events[idx];
    },

    deleteOne: async (id) => {
      if (!isFallback) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await EventModel.findByIdAndDelete(id);
      }

      const data = readJson();
      const idx = data.events.findIndex(e => e._id === id);
      if (idx === -1) return null;

      const deleted = data.events.splice(idx, 1)[0];
      
      // Also cleanup in users' registeredEvents lists
      data.users = data.users.map(u => ({
        ...u,
        registeredEvents: u.registeredEvents.filter(evId => evId !== id)
      }));

      writeJson(data);
      return deleted;
    }
  }
};

module.exports = db;
