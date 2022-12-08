import React, { useState, useEffect } from 'react';
import { ScrollView, TextInput, } from 'react-native';
import { Appbar, Button, Dialog, FAB, List, Portal, Provider as PaperProvider, Text, Title } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import { MdMovie } from 'react-icons/fa';
import { BiCameraMovie } from 'react-icons/fa';


const db = SQLite.openDatabase("sijainnit.db");

db.transaction(
  (tx) => {
    tx.executeSql(`CREATE TABLE IF NOT EXISTS Leffa (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    teksti TEXT,
                    ohjeistus TEXT
                  )`);
  }, 
  (err) => {
    console.log(err);    
  }
);


export default function App() {

 
  const [Leffa, setElokuva] = useState([]);
  const [uusiElokuvaDialogi, setuusiElokuvaDialogi] = useState({
                                                              nayta : false,
                                                              uusiElokuva : "",
                                                              uusiMielipide: ""
                                                           });
                                                           

  const tyhjennaLista = () => {

    db.transaction(
      (tx) => {
        tx.executeSql(`DELETE FROM Leffa`, [], 
          (_tx, rs) => {
            haeLeffa();
          }
        );
      }, 
      (err) => {
        console.log(err);
      }
    );    

  }

  const lisaalistaus = () => {

    db.transaction(
      (tx) => {
        tx.executeSql(`INSERT INTO Leffa (teksti, ohjeistus) VALUES (?, ?) `, [uusiElokuvaDialogi.uusiElokuva, uusiElokuvaDialogi.uusiMielipide], 
          (_tx, rs) => {
            haeLeffa();
          }
        );
      }, 
      (err) => {
        console.log(err);
      }
    );    

    setuusiElokuvaDialogi({nayta : false, uusiElokuva : "", uusiMielipide : ""});
   

  }

  

  

  const haeLeffa = () => {

    db.transaction(
      (tx) => {
        tx.executeSql(`SELECT * FROM Leffa`, [], 
          (_tx, rs) => {
            setElokuva(rs.rows._array);
          }
        );
      }, 
      (err) => {
        console.log(err);
      }
    );

  }

  useEffect(() => {
    
    haeLeffa();
  }, [])

  return (
    <PaperProvider>
      <Appbar.Header>
        <Appbar.Content title="My Movie List"/>
      </Appbar.Header>
      <ScrollView style={{padding : 20}}>

        <Title>Kaikki katsomani elokuvat</Title>

        {(Leffa.length > 0)
        ? Leffa.map((listaus) => {
          return <List.Item
                    key={listaus.id}
                    title={listaus.teksti}
                    description={listaus.ohjeistus}

                 />
        })
        : <Text>Et ole vielä listannut yhtään elokuvaa, aloita painamalla ruudun alareunassa olevaa lisäys nappulaa!</Text>
        }

     

        <Button
          icon="delete"
          color="orange"
          mode="contained"
          style={{ marginTop : 10 }}
          onPress={tyhjennaLista}
        >
          Tyhjennä elokuvat listastani
        </Button>

        <Portal>
          <Dialog visible={uusiElokuvaDialogi.nayta} onDismiss={ () => { setuusiElokuvaDialogi({ nayta : false,  uusiElokuva : ""}) } }>
            <Dialog.Title>Lisää Leffa</Dialog.Title>
            <Dialog.Content>
              <TextInput 
                label="Elokuvan Nimi"
                mode="outlined"
                placeholder="Kirjoita elokuvan nimi"
                onChangeText={ (teksti) => { setuusiElokuvaDialogi({...uusiElokuvaDialogi, uusiElokuva : teksti}) } }
              />

<TextInput 
                label="Milipide elokuvasta"
                mode="outlined"
                placeholder="Mitä mieltä olit elokuvasta?"
                onChangeText={ (ohjeistus) => { setuusiElokuvaDialogi({...uusiElokuvaDialogi, uusiMielipide : ohjeistus}) } }
              />

              
            </Dialog.Content>
            <Dialog.Actions>
              <Button 
                onPress={lisaalistaus}
              >Lisää listaan</Button>

              
            </Dialog.Actions>
          </Dialog>

          

          
        </Portal>

      </ScrollView>

      <FAB
          icon="plus"
          mode="contained"
          style={{ marginTop : 1 }}
          label="Lisää elokuva!"
          onPress={() => { setuusiElokuvaDialogi({nayta : true, uusiElokuva : ""}) }}
          
        >
          
        </FAB>
    </PaperProvider>
  );
}

