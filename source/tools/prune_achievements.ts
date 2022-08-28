import AL from "alclient"

//const ONE_HOUR_IN_MS = 3.6e+6
//const ONE_DAY_IN_MS = 8.64e+7
//const ONE_WEEK_IN_MS = 6.048e+8
//const ONE_MONTH_IN_MS = 2.628e+9
//const ONE_YEAR_IN_MS = 3.156e+10

export async function prune() {
    await AL.Game.loginJSONFile("./credentials.json")

    let lastName = undefined
    const idsToDelete: string[] = []
    console.log("Pruning achievements...")
    // eslint-disable-next-line sort-keys
    const achievements = await AL.AchievementModel.find({}, { _id: 1, name: 1, date: 1 }).sort({ name: 1, date: -1 }).lean().exec()
    for (const achievement of achievements) {
        if (achievement.name !== lastName) {
            // This is the latest data we have for the user, we want to keep it.
            lastName = achievement.name
            continue
        }

        console.log(`deleting ${achievement.name} @ ${achievement.date} (${achievement._id})`)
        idsToDelete.push(achievement._id)
    }

    await AL.AchievementModel.deleteMany({
        _id: { $in: idsToDelete }
    }).lean().exec()

    AL.Database.disconnect()
}

prune()