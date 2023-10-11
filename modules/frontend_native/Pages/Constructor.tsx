import {
  StyleSheet,
  View,
  TouchableOpacity,
  Vibration,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { AppStyles, MainContainer, globalElementStyle } from "../constants/styles";
import NavBar from "../navigation/CustomNavigator";
import Txt from "../components/Txt";
import Washing_icon from "../assets/icons/washing_icon.svg";
import Reagent_icon from "../assets/icons/reagent_icon.svg";
import Temperature_icon from "../assets/icons/temperature_icon.svg";
import React, { useEffect, useState } from "react";
import { LiquidDTO } from "sharedlib/dto/liquid.dto";
import DraggableFlatList from "react-native-draggable-flatlist";
import { ReagentStep, StepDTO, TemperatureStep, WashStep } from "sharedlib/dto/step.dto";
import { StepType } from "sharedlib/enum/DBEnums";
import { SvgProps } from "react-native-svg";
import WorkBlock from "./Block";
import { renderTimelineBlock } from "./TimeLineBlock";
import { updateTemperature } from "../common/constructorUtils";
import InputField from "../components/InputField";
import Close_icon from "../assets/icons/close.svg";
import Point_icon from "../assets/icons/point.svg";
import { DEFAULT_TEMEPRATURE, DEFAULT_WASH_STEP } from "../constants/protocol_constants";
import { ProtocolWithStepsDTO } from "sharedlib/dto/protocol.dto";
import { getRequest } from "../common/util";
import { CustomSelect } from "../components/Select";

export const stepTypeClass = new Map<StepType, string>([
  [StepType.WASHING, "washing"],
  [StepType.LIQUID_APPL, "reagent"],
  [StepType.TEMP_CHANGE, "temperature"],
]);

function StepTab(props: { type: StepType; active: boolean; onPress: () => void }) {
  let params = {
    main_color:
      AppStyles.color.block[
        `main_${stepTypeClass.get(props.type)}` as keyof typeof AppStyles.color.block
      ],
    back_color:
      AppStyles.color.block[
        `faded_${stepTypeClass.get(props.type)}` as keyof typeof AppStyles.color.block
      ],
    icon: {} as React.FC<SvgProps>,
  };
  switch (props.type) {
    case StepType.WASHING:
      {
        params.icon = Washing_icon;
      }
      break;
    case StepType.LIQUID_APPL:
      {
        params.icon = Reagent_icon;
      }
      break;
    case StepType.TEMP_CHANGE:
      {
        params.icon = Temperature_icon;
      }
      break;
  }
  return (
    <TouchableOpacity
      style={[
        s.tab,
        { backgroundColor: props.active ? params.back_color : AppStyles.color.elem_back },
      ]}
      onPressIn={props.onPress}
    >
      <View
        style={[
          s.tab_icon,
          { backgroundColor: props.active ? params.main_color : AppStyles.color.background },
        ]}
      >
        <params.icon
          height={25}
          width={25}
          fill={props.active ? AppStyles.color.elem_back : AppStyles.color.text_faded}
        />
      </View>
      <Txt
        style={[
          s.tab_label,
          {
            color: props.active ? AppStyles.color.text_primary : AppStyles.color.text_faded,
            fontWeight: props.active ? "bold" : "normal",
          },
        ]}
      >
        {stepTypeClass.get(props.type)}
      </Txt>
    </TouchableOpacity>
  );
}

interface ProtocolSettings {
  autoWashConfig: WashStep;
  timeUnits: "sec" | "min";
  description: String;
}

export default function Constructor(props: { id?: number }) {
  const [blocks, setBlocks] = useState<StepDTO[]>([]); //All steps
  const [workBlock, setWorkBlock] = useState<StepDTO>(); //Currently edited block
  const [currentTemp, setCurrentTemp] = useState(DEFAULT_TEMEPRATURE); //Last temperature used in steps
  const [preSaveModal, setPreSaveModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [customLiquids, setCustomLiquids] = useState<LiquidDTO[]>([]);
  const [protocolName, setProtocolName] = useState("protocol_001");
  const [defaultWashStep, setDefaultWashStep] = useState<WashStep | undefined>(undefined);
  const [settings, setSettings] = useState<ProtocolSettings>({
    autoWashConfig: defaultWashStep,
    timeUnits: "sec",
    description: "",
  } as ProtocolSettings);
  const [tempSettings, setTempSettings] = useState<ProtocolSettings>({
    autoWashConfig: defaultWashStep,
    timeUnits: "sec",
    description: "",
  } as ProtocolSettings);
  const [washLiquids, setWashLiquids] = useState<LiquidDTO[]>([]);

  function initialization() {
    if (props.id) {
      getRequest<ProtocolWithStepsDTO>(`/protocol/${props.id}`).then((r) => {
        setCustomLiquids(r.data.customLiquids);
        setDefaultWashStep(r.data.defaultWash);
      });
    } else {
      getRequest<LiquidDTO[]>(`/liquids`).then((r) => {
        setWashLiquids(r.data.filter((liq) => liq.type.id == 2));
        let defaultWashing = {
          iters: 1,
          incubation: 10,
          liquid: r.data.filter((liq) => liq.type.id == 2)[0],
          temperature: null,
        } as WashStep;
        setDefaultWashStep(defaultWashing);
      });
    }
  }

  useEffect(() => {
    initialization();
  }, []);

  function updateCustomLiquids(newLiquids: LiquidDTO[]) {
    setCustomLiquids(newLiquids);
  }

  useEffect(() => {}, [customLiquids]);

  function addBlock(newBlock: StepDTO) {
    const newID =
      blocks.length == 0
        ? 0
        : blocks.length == 1
        ? 1
        : blocks.reduce((prev, current) => (prev && prev.id > current.id ? prev : current)).id + 1;

    const finalBlocks = [
      ...blocks,
      {
        type: newBlock.type,
        id: newBlock.id == -1 ? newID : newBlock.id,
        params: { ...newBlock.params, temperature: currentTemp },
      } as StepDTO,
    ];
    handleBlocksChange(finalBlocks);
    setWorkBlock(undefined);
  }

  function editBlock(editedBlock: StepDTO) {
    let index = blocks.findIndex((x) => x.id == editedBlock.id);
    let newBlocks = [...blocks];

    if (editedBlock.type == StepType.TEMP_CHANGE) {
      let newTemp = (editedBlock.params as TemperatureStep).target as number;
      setCurrentTemp(newTemp);
    }

    let newEdited = { ...newBlocks[index] };
    newEdited.params = editedBlock.params;
    newEdited.type = editedBlock.type;

    newBlocks[index] = newEdited;
    handleBlocksChange(newBlocks);
    setWorkBlock(undefined);
  }

  function revealWorkBlock(step_data: StepDTO) {
    setWorkBlock(step_data);
  }

  function deleteBlock(blockToRemove: StepDTO) {
    const newBlocks = blocks.filter((block) => block.id !== blockToRemove.id);
    handleBlocksChange(newBlocks);
  }

  function handleBlocksChange(blocks: StepDTO[]) {
    let [newBlocks, newCurrentTemperature] = updateTemperature(blocks);
    setBlocks(newBlocks);
    setCurrentTemp(newCurrentTemperature);
  }

  function save() {
    let new_protocol = {
      id: -1,
      name: protocolName,
      customLiquids: customLiquids,
      description: "Lorem Ipsum",
      steps: blocks,
      creationDate: new Date(),
      defaultWash: defaultWashStep,
      author: null,
    } as ProtocolWithStepsDTO;

    console.log(new_protocol);
  }

  return (
    <MainContainer>
      <NavBar />
      {defaultWashStep != undefined && (
        <>
          <View style={[globalElementStyle.page_container]}>
            <View style={[s.header_section]}>
              <Txt style={{ fontSize: 24, fontFamily: "Roboto-bold", alignSelf: "center" }}>
                Protocol Constructor
              </Txt>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  style={[
                    s.save_proto_btn,
                    {
                      backgroundColor: AppStyles.color.block.faded_washing,
                      borderColor: AppStyles.color.background,
                      borderWidth: 1,
                      marginRight: 50,
                    },
                  ]}
                  onPress={() => setSettingsModal(true)}
                >
                  <Txt style={{ fontFamily: "Roboto-bold" }}>Workspace Settings</Txt>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.save_proto_btn, { backgroundColor: "#000" }]}
                  onPress={() => setPreSaveModal(true)}
                >
                  <Txt style={{ fontFamily: "Roboto-bold", color: AppStyles.color.elem_back }}>
                    Save Protocol
                  </Txt>
                </TouchableOpacity>
              </View>
            </View>
            <View style={s.body_section}>
              <View style={s.workspace_container}>
                <View style={s.tabs}>
                  <StepTab
                    type={StepType.WASHING}
                    active={workBlock?.type == StepType.WASHING}
                    onPress={() =>
                      revealWorkBlock({
                        type: StepType.WASHING,
                        id: -1,
                        params: {} as WashStep,
                      } as StepDTO)
                    }
                  />
                  <StepTab
                    type={StepType.LIQUID_APPL}
                    active={workBlock?.type == StepType.LIQUID_APPL}
                    onPress={() =>
                      revealWorkBlock({
                        type: StepType.LIQUID_APPL,
                        id: -1,
                        params: {} as ReagentStep,
                      } as StepDTO)
                    }
                  />
                  <StepTab
                    type={StepType.TEMP_CHANGE}
                    active={workBlock?.type == StepType.TEMP_CHANGE}
                    onPress={() =>
                      setWorkBlock({
                        type: StepType.TEMP_CHANGE,
                        id: -1,
                        params: {
                          source: currentTemp,
                        } as TemperatureStep,
                      } as StepDTO)
                    }
                  />
                </View>
                <View style={s.workspace}>
                  {workBlock != undefined && (
                    <WorkBlock
                      addBlock={addBlock}
                      editBlock={editBlock}
                      updateCustomLiquids={updateCustomLiquids}
                      customLiquids={customLiquids}
                      block={workBlock}
                    />
                  )}
                </View>
              </View>
              <View style={s.timeline}>
                <Txt style={s.timelineHeader}>Protocol timeline</Txt>
                <DraggableFlatList
                  style={{ marginHorizontal: 20 }}
                  containerStyle={{ paddingBottom: 60 }}
                  data={blocks}
                  onDragEnd={({ data }) => handleBlocksChange(data)}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={(params) =>
                    renderTimelineBlock({
                      renderParams: params,
                      deleteStep: deleteBlock,
                      editStep: revealWorkBlock,
                    })
                  }
                  onDragBegin={() => Vibration.vibrate([100])}
                />
              </View>
            </View>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={preSaveModal}
            onRequestClose={() => {
              setPreSaveModal(!preSaveModal);
            }}
          >
            <View style={s.modal_overlay}>
              <ScrollView
                contentContainerStyle={{
                  height: Dimensions.get("screen").height * 0.95,
                }}
                scrollEnabled={false}
              >
                <View style={s.modal_body}>
                  <View style={s.modal_header}>
                    <View style={{ flex: 5, flexDirection: "row", alignItems: "center" }}>
                      <Txt style={{ fontFamily: "Roboto-bold", marginRight: 20 }}>
                        Protocol Name:
                      </Txt>
                      <InputField onInputChange={setProtocolName} placeholder="Protocol Name" />
                    </View>
                    <TouchableOpacity
                      onPress={() => setPreSaveModal(false)}
                      style={{ flex: 1, alignItems: "flex-end" }}
                    >
                      <Close_icon width={40} height={40} />
                    </TouchableOpacity>
                  </View>
                  <View style={s.modal_list}>
                    <View style={[s.list_row, { backgroundColor: AppStyles.color.accent_dark }]}>
                      <View style={[s.list_cell, { flex: 1 }]}>
                        <Txt style={s.list_header_txt}>Step №</Txt>
                      </View>

                      <View style={[s.list_cell, { flex: 2 }]}>
                        <Txt style={s.list_header_txt}>Type</Txt>
                      </View>

                      <View style={[s.list_cell, { flex: 2 }]}>
                        <Txt style={s.list_header_txt}>Reagent</Txt>
                      </View>

                      <View style={[s.list_cell, { flex: 1 }]}>
                        <Txt style={s.list_header_txt}>Temperature</Txt>
                      </View>

                      <View style={[s.list_cell, { flex: 1 }]}>
                        <Txt style={s.list_header_txt}>Inc. time</Txt>
                      </View>

                      <View style={[s.list_cell, { flex: 1 }]}>
                        <Txt style={s.list_header_txt}>Iterations</Txt>
                      </View>
                    </View>
                    <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={true}>
                      {blocks.map((block, index) => {
                        return (
                          <View key={index}>
                            <View
                              key={index}
                              style={[
                                s.list_row,
                                {
                                  backgroundColor:
                                    index % 2 != 0
                                      ? AppStyles.color.background
                                      : AppStyles.color.elem_back,
                                },
                              ]}
                            >
                              <View style={[s.list_cell_id, { flex: 1 }]}>
                                <View
                                  style={{
                                    flex: 1,
                                    backgroundColor:
                                      block.type == StepType.LIQUID_APPL
                                        ? AppStyles.color.block.main_reagent
                                        : block.type == StepType.TEMP_CHANGE
                                        ? AppStyles.color.block.main_temperature
                                        : AppStyles.color.block.main_washing,
                                  }}
                                ></View>
                                <View
                                  style={{
                                    flex: 11,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Txt style={[s.list_cell_txt]}>{index + 1}</Txt>
                                </View>
                              </View>
                              <View style={[s.list_cell, { flex: 2 }]}>
                                <Txt style={s.list_cell_txt}>{block.type}</Txt>
                              </View>
                              <View style={[s.list_cell, { flex: 2 }]}>
                                <Txt style={s.list_cell_txt}>
                                  {block.type != StepType.TEMP_CHANGE
                                    ? (block.params as ReagentStep | WashStep).liquid.name
                                    : "-"}
                                </Txt>
                              </View>
                              <View style={[s.list_cell, { flex: 1 }]}>
                                <Txt style={s.list_cell_txt}>
                                  {block.type != StepType.TEMP_CHANGE
                                    ? (block.params as Partial<WashStep>).temperature
                                    : (block.params as TemperatureStep).target}
                                  °C
                                </Txt>
                              </View>
                              <View style={[s.list_cell, { flex: 1 }]}>
                                <Txt style={s.list_cell_txt}>
                                  {block.type != StepType.TEMP_CHANGE
                                    ? (block.params as ReagentStep | WashStep).incubation
                                    : "-"}
                                </Txt>
                              </View>

                              <View style={[s.list_cell, { flex: 1 }]}>
                                <Txt style={s.list_cell_txt}>
                                  {block.type == StepType.WASHING
                                    ? (block.params as WashStep).iters
                                    : "-"}
                                </Txt>
                              </View>
                            </View>
                            {block.type == StepType.LIQUID_APPL &&
                              (block.params as ReagentStep).autoWash == true && (
                                <View
                                  key={index + 200}
                                  style={[
                                    s.list_row,
                                    {
                                      backgroundColor: AppStyles.color.block.faded_washing,
                                    },
                                  ]}
                                >
                                  <View style={[s.list_cell_id, { flex: 1 }]}>
                                    <View
                                      style={{
                                        flex: 1,
                                        backgroundColor: AppStyles.color.block.main_washing,
                                      }}
                                    ></View>
                                    <View
                                      style={{
                                        flex: 11,
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <Txt style={[s.list_cell_txt]}>*</Txt>
                                    </View>
                                  </View>
                                  <View style={[s.list_cell, { flex: 2 }]}>
                                    <Txt style={s.list_cell_txt}>Auto-washing</Txt>
                                  </View>
                                  <View style={[s.list_cell, { flex: 2 }]}>
                                    <Txt style={s.list_cell_txt}>
                                      {" "}
                                      {defaultWashStep.liquid.name}
                                    </Txt>
                                  </View>
                                  <View style={[s.list_cell, { flex: 1 }]}>
                                    <Txt style={s.list_cell_txt}>
                                      {(block.params as ReagentStep).temperature}
                                      °C
                                    </Txt>
                                  </View>
                                  <View style={[s.list_cell, { flex: 1 }]}>
                                    <Txt style={s.list_cell_txt}>{defaultWashStep.incubation}</Txt>
                                  </View>
                                  <View style={[s.list_cell, { flex: 1 }]}>
                                    <Txt style={s.list_cell_txt}>{defaultWashStep.iters}</Txt>
                                  </View>
                                </View>
                              )}
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
                  <View style={s.modal_footer}>
                    <TouchableOpacity
                      style={[s.modal_btn, { backgroundColor: AppStyles.color.secondary }]}
                      onPress={() => {
                        setPreSaveModal(false);
                        save();
                      }}
                    >
                      <Txt style={s.modal_btn_text}>SAVE</Txt>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.modal_btn, { backgroundColor: AppStyles.color.primary }]}
                      onPress={() => {
                        setPreSaveModal(false);
                      }}
                    >
                      <Txt style={s.modal_btn_text}>RETURN</Txt>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>

          <Modal
            animationType="fade"
            transparent={true}
            visible={settingsModal}
            onRequestClose={() => {
              setPreSaveModal(!settingsModal);
            }}
          >
            <View style={stng.modal_container}>
              <View style={stng.modal_body}>
                <ScrollView scrollEnabled={true}>
                  <View style={stng.section}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Point_icon height={15} width={15} stroke={AppStyles.color.primary} />
                      <Txt style={stng.topic}> Edit automatic washing step:</Txt>
                    </View>
                    <View>
                      {/* <CustomSelect
                        list={washLiquids}
                        selected={settings.autoWashConfig.liquid || washLiquids[0]}
                        canAdd={false}
                        label="REAGENT:"
                        onChangeSelect={(liq) => {
                          setTempSettings({
                            ...settings,
                            autoWashConfig: {
                              liquid: liq,
                              iters: tempSettings.autoWashConfig.iters,
                              incubation: tempSettings.autoWashConfig.incubation,
                            } as WashStep,
                          });
                        }}
                      /> */}
                      <Txt>{defaultWashStep.liquid.name}</Txt>
                      <Txt>{washLiquids[0].name}</Txt>
                      <Txt>{settings.autoWashConfig?.liquid.name}</Txt>
                    </View>
                  </View>
                  <View style={stng.section}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Point_icon height={15} width={15} stroke={AppStyles.color.primary} />
                      <Txt style={stng.topic}> Default time units:</Txt>
                    </View>
                    <View>
                      <InputField
                        onInputChange={() => {
                          setTempSettings({
                            ...settings,
                            timeUnits: "sec",
                          });
                        }}
                      />
                    </View>
                  </View>
                  <View style={stng.section}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Point_icon height={15} width={15} stroke={AppStyles.color.primary} />
                      <Txt style={stng.topic}> Add protocol description:</Txt>
                    </View>
                    <View>
                      <InputField
                        multiline={true}
                        onInputChange={(e) => {
                          setSettings({
                            ...settings,
                            description: e,
                          });
                        }}
                      />
                    </View>
                  </View>
                </ScrollView>

                <View
                  style={{
                    flexDirection: "row",
                    paddingTop: 40,
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity
                    style={[s.modal_btn, { backgroundColor: AppStyles.color.warning }]}
                    onPress={() => {
                      setSettingsModal(false);
                    }}
                  >
                    <Txt style={s.modal_btn_text}>APPLY</Txt>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.modal_btn, { backgroundColor: AppStyles.color.accent_dark }]}
                    onPress={() => {
                      setSettingsModal(false);
                    }}
                  >
                    <Txt style={s.modal_btn_text}>DISCARD</Txt>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </MainContainer>
  );
}

const s = StyleSheet.create({
  header_section: {
    flex: 1,
    width: "100%",
    paddingHorizontal: "2%",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: AppStyles.color.elem_back,
  },

  save_proto_btn: {
    width: 200,
    borderRadius: 8,
    paddingHorizontal: "5%",
    paddingVertical: "3%",
    alignItems: "center",
  },

  body_section: {
    flex: 11,
    flexDirection: "row",
  },

  workspace_container: {
    flex: 1,
  },

  timeline: {
    backgroundColor: AppStyles.color.background,
    flex: 1,
    flexDirection: "column",
  },

  timelineHeader: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 18,
    fontFamily: "Roboto-bold",
    color: AppStyles.color.text_primary,
  },

  tabs: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: AppStyles.color.background,
  },

  tab_icon: {
    height: 45,
    width: 45,
    borderRadius: 23,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  tab_label: {
    textTransform: "uppercase",
    color: AppStyles.color.text_faded,
    fontFamily: "Roboto-bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },

  workspace: {
    flex: 7,
    backgroundColor: AppStyles.color.elem_back,
  },

  modal_overlay: {
    flex: 1,
    backgroundColor: "#001f6d42",
  },

  modal_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#001f6d42",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },

  modal_body: {
    flex: 1,
    flexDirection: "column",
    borderRadius: 8,
    marginHorizontal: 50,
    marginTop: 50,
    marginBottom: 100, //For whatever reason margin 100 from bottom == 50 from top
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
    backgroundColor: AppStyles.color.elem_back,
  },

  modal_header: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "2%",
  },

  modal_list: {
    flex: 5,
  },

  modal_footer: {
    flex: 1,
    alignItems: "center",
    borderTopColor: AppStyles.color.background,
    borderTopWidth: 1,
    paddingVertical: "1%",
    paddingHorizontal: "10%",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  modal_btn: {
    width: 150,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginHorizontal: 20,
  },

  modal_btn_text: {
    color: AppStyles.color.elem_back,
    fontFamily: "Roboto-bold",
  },

  list_row: {
    flexDirection: "row",
    width: "100%",
    height: 40,
  },

  list_header: {
    backgroundColor: AppStyles.color.text_primary,
    borderWidth: 1,
    borderColor: AppStyles.color.elem_back,
  },

  list_cell: {
    borderWidth: 0.5,
    borderColor: AppStyles.color.elem_back,
    alignItems: "center",
    justifyContent: "center",
  },

  list_cell_id: {
    borderWidth: 0.5,
    borderColor: AppStyles.color.elem_back,
    flexDirection: "row",
  },

  list_cell_txt: {
    color: AppStyles.color.text_primary,
  },

  list_odd_cell: {
    backgroundColor: AppStyles.color.background,
  },
  list_even_cell: {
    backgroundColor: AppStyles.color.elem_back,
  },

  list_header_txt: {
    color: AppStyles.color.elem_back,
    fontFamily: "Roboto-bold",
  },
});

const stng = StyleSheet.create({
  modal_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#001f6d42",
  },

  modal_body: {
    backgroundColor: AppStyles.color.elem_back,
    borderRadius: 8,
    padding: 40,
    // alignItems: "center",
    // justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
    height: Dimensions.get("screen").height * 0.6,
    width: Dimensions.get("screen").width * 0.4,
  },

  section: {
    alignSelf: "stretch",
    flexDirection: "column",
    // borderTopColor: AppStyles.color.background,
    // borderTopWidth: 1,
    borderBottomColor: AppStyles.color.background,
    borderBottomWidth: 1,
    paddingVertical: 15,
  },

  topic: {
    fontFamily: "Roboto-thin",
    fontSize: 18,
    marginLeft: 10,
  },
});
