import AL, { PingCompensatedCharacter, SkillName } from "alclient"

export type Loop<Type> = {
    fn: (bot: Type) => Promise<void>,
    /** If number, it will loop every this many ms. If SkillName, it will loop based on the cooldown of the skills in the array */
    interval: SkillName[] | number
}

export type LoopName =
    | "attack"
    | "heal"
    | "loot"
    | "merchant_stand"
    | "move"
    | "party"

export type Loops<Type> = Map<LoopName, Loop<Type>>

export interface Strategy<Type> {
    loops: Loops<Type>
}

export class Strategist<Type extends PingCompensatedCharacter> {
    public bot: Type

    private loops: Loops<Type> = new Map<LoopName, Loop<Type>>()
    private stopped = false
    private timeouts = new Map<LoopName, NodeJS.Timeout>()

    public constructor(bot: Type, initialStrategy?: Strategy<Type>) {
        this.bot = bot

        this.bot.socket.on("disconnect", () => { this.reconnect() })

        this.applyStrategy(initialStrategy)
    }

    public applyStrategy(strategy: Strategy<Type>) {
        if (!strategy) return // No strategy

        for (const [name, fn] of strategy.loops) {
            if (fn == undefined) {
                // Stop the loop
                this.stopLoop(name)
            } else if (this.loops.has(name)) {
                // Change the loop
                this.loops.set(name, fn)
            } else {
                // Start the loop
                this.loops.set(name, fn)

                const newLoop = async () => {
                    try {
                        const loop = this.loops.get(name)
                        if (!loop || this.stopped) return // Stop the loop
                        await loop.fn(this.bot) // Run the loop
                    } catch (e) {
                        console.error(e)
                    }
                    if (!this.stopped) {
                        const loop = this.loops.get(name)
                        if (loop) {
                            if (typeof loop.interval == "number") this.timeouts.set(name, setTimeout(async () => { newLoop() }, loop.interval)) // Continue the loop
                            else if (Array.isArray(loop.interval)) {
                                const cooldown = Math.min(...loop.interval.map((skill) => this.bot.getCooldown(skill)))
                                this.timeouts.set(name, setTimeout(async () => { newLoop() }, cooldown)) // Continue the loop
                            }
                        }
                    }
                }
                newLoop()
            }
        }
    }

    public applyStrategies(strategies: Strategy<Type>[]) {
        for (const strategy of strategies) this.applyStrategy(strategy)
    }

    public async reconnect(): Promise<void> {
        if (this.bot.socket.connected) this.bot.disconnect()
        if (this.bot.socket.disconnected) {
            try {
                await this.bot.connect()
            } catch (e) {
                console.error(e)
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) {
                    setTimeout(async () => { this.reconnect() }, 2000 + Number.parseInt(wait[1]) * 1000)
                } else if (/limits/.test(e)) {
                    setTimeout(async () => { this.reconnect() }, AL.Constants.RECONNECT_TIMEOUT_MS)
                } else {
                    setTimeout(async () => { this.reconnect() }, 10000)
                }
            }
        }
    }

    public stopLoop(loopName: LoopName): void {
        // Delete the loop
        this.loops.delete(loopName)

        // Clear the timeout
        const timeout = this.timeouts.get(loopName)
        if (timeout) clearTimeout(timeout)
    }

    public stop(): void {
        this.stopped = true
        for (const [, timeout] of this.timeouts) clearTimeout(timeout)
        this.bot.disconnect()
    }
}