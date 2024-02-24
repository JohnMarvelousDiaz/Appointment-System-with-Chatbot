import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { firebase } from '../firebase-config';
import ChartDataLabels from 'chartjs-plugin-datalabels';

function ReportPage() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const firestore = firebase.firestore();

    const docRef = firestore.collection('buttonClick').doc('totalClicks');

    const unsubscribe = docRef.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        setChartData({
          labels: ['Enrollment', 'Advising', 'Others'],
          datasets: [
            {
              data: [data.enrbutton, data.advisingbutton, data.othersbutton],
              backgroundColor: ['red', 'blue', 'green'],
            },
          ],
        });
      }
    });

    // Return a cleanup function to unsubscribe when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '270px' }}>
      {chartData && (
        <Pie
          data={chartData}
          options={{
            cutoutPercentage: 50,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
              },
              datalabels: {
                color: 'white',
                formatter: (value, context) => {
                  const label = context.chart.data.labels[context.dataIndex];
                  return `${label}: ${value}`;
                  // const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                  // const percentage = ((value / total) * 100).toFixed(2);
                  // return `${percentage}%`;

                },
                anchor: 'end',
                align: 'start',
                offset: 8,
              },
            },
          }}
          plugins={[ChartDataLabels]}
        />
      )}
    </div>
  );
}

export default ReportPage;
