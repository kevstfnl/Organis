const { Prisma } = require("@prisma/client");
const bcrypt = require("bcrypt");

module.exports = Prisma.defineExtension({
    name: "hashPassword",
    query: {
        user: {
            create: async ({ args, query }) => {
                const hash = await bcrypt.hash(args.data.password, 10);
                args.data.password = hash;
                return query(args);
            },
            update: async ({ args, query }) => {
                if (!args.data.password) return query(args);
                const hash = await bcrypt.hash(args.data.password, 10);
                args.data.password = hash;
                return query(args);
            },
        }
    }
});

async function hash({ args, query }) {
    const hash = await bcrypt.hash(args.data.password, 10);
    args.data.password = hash;
    return query(args);
}