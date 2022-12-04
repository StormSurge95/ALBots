import AL from "../../../ALClient/build/index.js"

const ONE_DAY_IN_MS = 8.64e+7

export async function prune() {
    await AL.Game.loginJSONFile("./credentials.json")
    const oneDayAgo = Date.now() - ONE_DAY_IN_MS

    const idsToDelete: string[] = []
    console.log("Pruning achievements...")
    // eslint-disable-next-line sort-keys
    const entities = await AL.EntityModel.find({}, { _id: 1, type: 1, lastSeen: 1 }).sort({ type: 1, lastSeen: -1 }).lean().exec()
    for (const entity of entities) {
        if (entity.lastSeen <= oneDayAgo) {
            console.log(`deleting ${entity.type} in ${entity.serverRegion}${entity.serverIdentifier} @ ${entity.lastSeen} (over 1 day ago; most likely dead) (${entity._id})`)
            idsToDelete.push(entity._id)
        }
    }

    await AL.EntityModel.deleteMany({
        _id: { $in: idsToDelete }
    }).lean().exec()

    AL.Database.disconnect()

    process.exit(0)
}

prune()