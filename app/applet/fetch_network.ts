import Papa from 'papaparse';

const url = 'https://docs.google.com/spreadsheets/d/1fvb5M7f-rajXCgPF7ntDiQaeD6mJwq_5jdo6TL_NsKQ/gviz/tq?tqx=out:csv&sheet=Network';

fetch(url)
  .then(res => res.text())
  .then(text => {
    Papa.parse(text, {
      header: true,
      complete: (results) => {
        console.log("Headers:", results.meta.fields);
        console.log("First row:", results.data[0]);
      }
    });
  });
