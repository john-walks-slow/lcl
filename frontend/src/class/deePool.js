const EMPTY_SLOT = Object.freeze(Object.create(null))

module.exports = { create }
module.exports.create = create

// ******************************

/**
 * @typedef {ReturnType<typeof create<T>>} DeePool
 * @template T
 */
/**
 * create a new pool
 * @param {function():T} objectFactory
 * @template T
 */
function create(objectFactory = () => ({})) {
  var objPool = []
  var nextFreeSlot = null // pool location to look for a free object to use
  return {
    pool: objPool,
    use,
    recycle,
    grow,
    size,
  }

  // ******************************
  /** @type {function():T} use**/
  function use() {
    if (nextFreeSlot == null || nextFreeSlot == objPool.length) {
      objPool.length == 0 ? grow(5) : grow()
    }

    var objToUse = objPool[nextFreeSlot]
    objPool[nextFreeSlot++] = EMPTY_SLOT
    return objToUse
  }

  function recycle(obj) {
    if (nextFreeSlot == null || nextFreeSlot == -1) {
      objPool[objPool.length] = obj
    } else {
      objPool[--nextFreeSlot] = obj
    }
  }

  function grow(count = objPool.length) {
    if (count > 0 && nextFreeSlot == null) {
      nextFreeSlot = 0
    }

    if (count > 0) {
      var curLen = objPool.length
      objPool.length += Number(count)

      for (var i = curLen; i < objPool.length; i++) {
        // add new obj to pool
        objPool[i] = objectFactory()
      }
    }

    return objPool.length
  }

  function size() {
    return objPool.length
  }
}
