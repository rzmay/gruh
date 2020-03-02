import React from 'react';
import './Home.scss';
import Layout from '../../components/Navigation/Navigation';
import GruhView from '../../components/GruhVeiw/GruhView';
import { useFocusContext } from '../../services/context.service';

function Home(): React.ReactElement {
  const { focusState } = useFocusContext();
  console.log(`Home: ${focusState}`);

  return (
    <Layout visible={!(focusState)} home>
      <GruhView />
    </Layout>
  );
}

export default Home;
