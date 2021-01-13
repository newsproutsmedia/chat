module.exports = class Entity {
    constructor (id) {
        this.id = id;
    }

    equals (other) {
        if (other instanceof Entity === false) {
            return false
        }

        return other.id
            ? this.referenceEquals(other.id)
            : this === other
    }

    referenceEquals (id) {
        if (!this.id) {
            // Try object equality
            return this.equals(id)
        }

        const reference = typeof id !== 'string'
            ? id.toString()
            : id

        return this.id === reference
    }

    toString () {
        return this.id
    }
}