/* eslint-disable @typescript-eslint/no-explicit-any */
import { AchievementProgressData, Character, ClientToServerSkillData, LimitDCReportData, SkillTimeoutData } from "../../../../ALClient/build/index.js"
import { Strategy } from "../context.js"

type DebugOptions = {
    /** The size of the events log (default 500) */
    logEventsSize?: number

    /** Will log when you get achievement points */
    logAchievementProgress?: boolean
    /** Will log when we attack */
    logAttacks?: boolean
    /** Will log when we equip things */
    logEquips?: boolean
    /** Will log the report that tells you how many commands you ran when you are disconnected for doing too many code calls */
    logLimitDCReport?: boolean
    /** Will log when we receive a penalty */
    logPenalties?: boolean
    /** Will log when we use a skill */
    logSkills?: boolean
    /** Will log when we receive a skill timeout */
    logSkillTimeouts?: boolean
}

/**
 * Logs data to console
 * TODO: Log to files, too.
 */
export class DebugStrategy<Type extends Character> implements Strategy<Type> {
    private logAllIncoming: (name: string, data: unknown) => void
    private logAllOutgoing: (name: string, data: unknown) => void

    private logAchievementProgress: (data: AchievementProgressData) => void
    private logAttacks: (name: string, data: unknown) => void
    private logEquips: (name: string, data: unknown) => void
    private logLimitDCReport: (data: LimitDCReportData) => void
    private logPenalty: (name: string, data: unknown) => void
    private logSkills: (name: string, data: ClientToServerSkillData) => void
    private logSkillTimeouts: (data: SkillTimeoutData) => void

    public static events = new Map<string, string[]>()

    public options: DebugOptions

    public constructor(options?: DebugOptions) {
        if (options == undefined) options = {}
        if (options.logEventsSize === undefined) options.logEventsSize = 500
        this.options = options
    }

    /**
     * Gets the last events for the given character ID
     *
     * `<=` are outgoing events
     *
     * `=>` are incoming events
     *
     * @param id Character ID
     * @returns
     */
    public static getEvents(id: string) {
        return DebugStrategy.events.get(id)
    }

    public onApply(bot: Type) {
        // Reset events
        DebugStrategy.events.set(bot.id, [])

        this.logAllIncoming = (name: string, data: unknown) => {
            // Add the new event
            const events = DebugStrategy.events.get(bot.id)
            events.push(`[${this.getTimestamp()}] => [${name}] ${JSON.stringify(data)}`)

            // Trim events
            if (events.length > this.options.logEventsSize) events.splice(events.length - this.options.logEventsSize, this.options.logEventsSize)
        }
        bot.socket.onAny(this.logAllIncoming)

        this.logAllOutgoing = (name: string, data: unknown) => {
            // Add the new event
            const events = DebugStrategy.events.get(bot.id)
            events.push(`[${this.getTimestamp()}] <= [${name}] ${JSON.stringify(data)}`)

            // Trim events
            if (events.length > this.options.logEventsSize) events.splice(events.length - this.options.logEventsSize, this.options.logEventsSize)
        }
        bot.socket.onAnyOutgoing(this.logAllOutgoing)

        if (this.options.logAchievementProgress) {
            this.logAchievementProgress = (data: AchievementProgressData) => {
                if ((data as any).count && (data as any).needed) {
                    bot.debug(`[logAchievementProgress] ${(data as any).count}/${(data as any).needed}`)
                }
            }
            bot.socket.on("achievement_progress", this.logAchievementProgress)
        }

        if (this.options.logAttacks) {
            this.logAttacks = (name: string, data: unknown) => {
                if (name !== "attack") return
                bot.debug(`[logAttacks] ${JSON.stringify(data)}`)
            }
            bot.socket.onAnyOutgoing(this.logAttacks)
        }

        if (this.options.logEquips) {
            this.logEquips = (name: string, data: unknown) => {
                if (name !== "equip") return
                bot.debug(`[logEquips] ${JSON.stringify(data)}`)
            }
            bot.socket.onAnyOutgoing(this.logEquips)
        }

        if (this.options.logLimitDCReport) {
            this.logLimitDCReport = (data: LimitDCReportData) => {
                bot.debug("=== START LIMITDCREPORT ===")
                bot.debug(JSON.stringify(data, undefined, 4))
                bot.debug("==== END LIMITDCREPORT ====")
            }
            bot.socket.on("limitdcreport", this.logLimitDCReport)
        }

        if (this.options.logPenalties) {
            this.logPenalty = (name: string, data: unknown) => {
                if (typeof data !== "object") return
                if ((data as any).penalty) {
                    bot.debug(`[logPenalties] ${JSON.stringify(data)}`)
                }
            }
            bot.socket.onAny(this.logPenalty)
        }

        if (this.options.logSkills) {
            this.logSkills = (name: string, data: ClientToServerSkillData) => {
                if (name !== "skill") return
                bot.debug(`[logSkills] ${JSON.stringify(data)}`)
            }
            bot.socket.onAnyOutgoing(this.logSkills)
        }

        if (this.options.logSkillTimeouts) {
            this.logSkillTimeouts = (data: SkillTimeoutData) => {
                bot.debug(`[logSkillTimeouts] ${JSON.stringify(data)}`)
            }
            bot.socket.on("skill_timeout", this.logSkillTimeouts)
        }
    }

    public onRemove(bot: Type) {
        bot.socket.offAny(this.logAllIncoming)
        bot.socket.offAnyOutgoing(this.logAllOutgoing)
        if (this.logAchievementProgress) bot.socket.off("achievement_progress", this.logAchievementProgress)
        if (this.logAttacks) bot.socket.offAnyOutgoing(this.logAttacks)
        if (this.logLimitDCReport) bot.socket.off("limitdcreport", this.logLimitDCReport)
        if (this.logPenalty) bot.socket.offAny(this.logPenalty)
        if (this.logSkills) bot.socket.offAnyOutgoing(this.logSkills)
        if (this.logSkillTimeouts) bot.socket.off("skill_timeout", this.logSkillTimeouts)
    }

    protected getTimestamp(): string {
        return (new Date()).toISOString()
    }
}