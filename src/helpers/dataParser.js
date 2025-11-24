import moment from 'moment';

const cleanString = (data) => data.split('\u0000').join('').trim();

export const parseCedulaData = (data) => {
  const lastName = cleanString(data.slice(58, 80))
  const secondLastName = cleanString(data.slice(80, 104))
  const firstName = cleanString(data.slice(103, 127))
  const middleName = cleanString(data.slice(126, 150))
  return {
    afisCode: cleanString(data.slice(1, 10)),
    fingerCard: cleanString(data.slice(39, 48)),
    documentNumber: cleanString(data.slice(48, 58)),
    fullName: `${firstName}${middleName ? ` ${middleName}` : ''} ${lastName} ${secondLastName || ''}`.trim(),
    lastName,
    secondLastName,
    firstName,
    middleName,
    gender: cleanString(data.slice(151, 152)) === 'M' ? 'MASCULINO' : 'FEMENINO',
    birthday: moment(cleanString(data.slice(152, 160)), 'YYYYMMDD'),
    municipalCode: cleanString(data.slice(160, 162)),
    departmentCode: cleanString(data.slice(162, 165)),
    bloodType: cleanString(data.slice(166, 169)),
  };
};
