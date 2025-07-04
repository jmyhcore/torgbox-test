//No dots in short names 'cause regexp before dictionary call should remove dots.
//Also even if we will have undoted short month, no rework will be needed
//also removed duplicate of May month
const months = {
  'января': 1,
  'февраля': 2,
  'марта': 3,
  'апреля': 4,
  'мая': 5,
  'июня': 6,
  'июля': 7,
  'августа': 8,
  'сентября': 9,
  'октября': 10,
  'ноября': 11,
  'декабря': 12,
  'янв': 1,
  'февр': 2,
  'мар': 3,
  'апр': 4,
  'июн': 6,
  'июл': 7,
  'авг': 8,
  'сен': 9,
  'окт': 10,
  'ноя': 11,
  'дек': 12,
}

const parseDate = (params) => {
  //Prepare data
  let element = params.src[params.options].replace(/[«»"']/g, "").trim()
  let timezone = element.match(/[+-](\d{2}):(\d{2})$/) //extract timezone
  if (timezone) element = element.split('+')[0]

  //Extract all possible format variants
  const ddmmyyyy = element.match(/(\d{2})[-.\/](\d{2})[-.\/](\d{4})/) //DD[-./]MM[-./]YYYY case
  const dmonthyyyy = element.match(/(\d{1,2})\s+([а-я]+)\s+(\d{4})/i) //d month YYYY case
  const dmonyyyy = element.match(/(\d{1,2})\s+([а-я]{3})\.?\s+(\d{4})/i)//d mon. YYYY case

  const yyyymmdd = element.match(/(\d{4})[-.\/](\d{2})[-.\/](\d{2})/) //YYYY[-./]MM[-./]DD case

  let fulldate = null, parsedDay = 0, parsedMonth = 0, parsedYear = 0, parsedHours = 0, parsedMinutes = 0, parsedSeconds = 0, parsedMillis = 0

  if (yyyymmdd) [fulldate, parsedYear, parsedMonth, parsedDay] = yyyymmdd //special case, year is leading
  else[fulldate, parsedDay, parsedMonth, parsedYear] = ddmmyyyy || dmonthyyyy || dmonyyyy

  //Handle shortmonth/fullmonth situations
  if (months[parsedMonth]) parsedMonth = months[parsedMonth]

  //T means we have some sort of ISO format
  //Todo: regex is better? Sigle letter can appear randomly
  if (element.indexOf('T') >= 0) {
    let timeMatch = element.match(/T(\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?)/) //extract TIME (after T)
    timeMatch = timeMatch[1].match(/^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/) //parse HH:MM:SS(optional).SSS(optional)

    parsedHours = timeMatch[1] || 0
    parsedMinutes = timeMatch[2] || 0
    parsedSeconds = timeMatch[3] || 0
    parsedMillis = timeMatch[4] || 0
  } else {
    //Current element is not ISO like
    //Extract time if exists
    const timeMatch = element.match(/(\d{1,2}):(\d{2})/)
    if (timeMatch) {
      parsedHours = timeMatch[1] || 0
      parsedMinutes = timeMatch[2] || 0
    }
    //No seconds here so fill with 0's
    parsedSeconds = 0
    parsedMillis = 0
  }

  let result = new Date(Date.UTC(parsedYear, parsedMonth - 1, parsedDay, parsedHours, parsedMinutes, parsedSeconds, parsedMillis)).toISOString()

  //Handle timezone. Remove 'Z' from end, add +HH:MM
  if (timezone) result = result.split('Z')[0] + timezone[0]
  return result
}

module.exports = parseDate