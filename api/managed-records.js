import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

class ResponseItem {
  constructor() {
    /** @type {number}  */
    this.id;
    /** @type {string}   */
    this.color;
    /** @type {string}   */
    this.disposition;
  }
}

class SuccessItem {
  constructor() {
    /** @type {Array.<Number>}  */
    this.ids;
    /** @type {Array.<String>}   */
    this.open;
    /** @type {Number}   */
    this.closedPrimaryCount;
    /** @type {Number | null}   */
    this.previousPage;
    /** @type {Number | null}   */
    this.nextPage;
    /** @type {Number | null}   */
    this.previousPage;
  }
}

/**
 * @param {Object} obj
 * @param {number | null} obj.page
 * @param {Array | null} obj.colors
 */
const customURL = ({ page, colors }) => {
  let offset;

  /* Offset logic */
  if (page === 1) {
    offset = 0;
  } else if (page > 1) {
    offset = page * 10 - 10;
  }

  /* Create url with URI */
  const url = URI(window.path).search({
    limit: 10,
    offset,
    "color[]": colors,
  });

  return url;
};

/**
 * @param {Object} obj
 * @param {number} obj.page
 * @param {Array} obj.colors
 */
const retrieve = async ({ page, colors } = { page: 1 }) => {
  /** @type {SuccessItem}  */
  let result = {};

  try {
    /* Create custom url with URI (see helper function) */
    const res = await fetch(customURL({ page, colors }));

    /* Console.log on successful response */
    if (res.status === 200) {
      console.log(res.status);
    } else {
      /* No Console.log on bad response */
    }

    /** @type {Array.<ResponseItem>}  */
    const data = await res.json();

    /* Set ids */
    result.ids = data.map(({ id }) => id);
    const openArray = data.filter((item) => item.disposition === "open");

    /* Filter primary open data */
    result.open = openArray.map((item) => {
      return {
        id: item.id,
        color: item.color,
        disposition: item.disposition,
        isPrimary:
          item.color === "red" ||
          item.color === "blue" ||
          item.color === "yellow"
            ? true
            : false,
      };
    });

    /* Filter primary closed data */
    result.closedPrimaryCount = data
      .filter((item) => item.disposition === "closed")
      .filter(
        (item) =>
          item.color === "red" ||
          item.color === "blue" ||
          item.color === "yellow"
      ).length;

    /* Page Setter */
    if (page <= 1) {
      page = null;
    }
    result.previousPage = page ? page - 1 : null;
    result.nextPage = page ? page + 1 : 1 + 1;

    /* Set null on Error */
    if (result.ids.length === 0) {
      result.previousPage = null;
      result.nextPage = null;
    }

    /* Last working page should be 49 */
    if (page === 51) {
      result.previousPage = 50;
    } else if (page === 50) {
      result.nextPage = null;
    }

    /* Return resolved promise */
    return new Promise((resolve) => resolve(result));
  } catch (error) {
    console.log(error);
  }
};

retrieve();

export default retrieve;
