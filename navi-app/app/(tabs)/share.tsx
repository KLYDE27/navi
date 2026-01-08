import * as DocumentPicker from "expo-document-picker";
import { AlertCircle, CheckCircle, ChevronDown, FileText, Upload, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import sampleData from "../../data/sample-data.json";
import { Colors, Typography, Layout, Icons, Spacing } from "../../constants/Theme";
import { LinearGradient } from "expo-linear-gradient";

interface UploadedFile {
    name: string;
    uri: string;
}

interface Subject {
    id: string;
    name: string;
    icon: string;
    description: string;
}

export default function ShareScreen() {
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [professorName, setProfessorName] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorTitle, setErrorTitle] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successTitle, setSuccessTitle] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const subjects = sampleData.subjects as Subject[];

    const showError = (title: string, message: string) => {
        setErrorTitle(title);
        setErrorMessage(message);
        setIsErrorModalOpen(true);
    };

    const showSuccess = (title: string, message: string) => {
        setSuccessTitle(title);
        setSuccessMessage(message);
        setIsSuccessModalOpen(true);
    };

	const resetForm = () => {
        setSelectedSubject(null);
        setProfessorName("");
        setUploadedFiles([]);
    };

    const handleFileUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            if (file) {
                const uploadedFile: UploadedFile = {
                    name: file.name || "document.pdf",
                    uri: file.uri,
                };
                setUploadedFiles((prev) => [...prev, uploadedFile]);
            }
        } catch (error) {
            showError("Upload Error", "Unable to access files. Check permissions.");
        }
    };

    const handleSubmit = () => {
        if (!selectedSubject || !professorName.trim() || uploadedFiles.length === 0) {
            showError("Missing Fields", "Please complete all required fields (*).");
            return;
        }

		// More backend
        showSuccess("Submitted!", "Your materials are under review. You'll earn points once approved!");
    
		resetForm();
	};

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Share Materials</Text>
                <Text style={styles.subtitle}>Upload PDFs to improve the AI and earn Stardust</Text>
            </View>

            <View style={styles.form}>
                {/* Subject Dropdown */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Subject <Text style={styles.required}>*</Text></Text>
                    <TouchableOpacity 
                        style={styles.dropdown} 
                        onPress={() => setIsDropdownOpen(true)}
                    >
                        <Text style={[styles.dropdownText, !selectedSubject && styles.dropdownPlaceholder]}>
                            {selectedSubject ? selectedSubject.name : "Select a subject"}
                        </Text>
                        <ChevronDown color={Colors.textMuted} size={20} />
                    </TouchableOpacity>
                </View>

                {/* Professor Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Professor Name <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Dr. John Smith"
                        placeholderTextColor={Colors.textMuted}
                        value={professorName}
                        onChangeText={setProfessorName}
                    />
                </View>

                {/* File Upload */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Course Materials (PDF) <Text style={styles.required}>*</Text></Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
                        <Upload color={Colors.primary} size={20} />
                        <Text style={styles.uploadButtonText}>Upload PDF File</Text>
                    </TouchableOpacity>

                    {uploadedFiles.map((file, index) => (
                        <View key={index} style={styles.fileItem}>
                            <FileText color={Colors.primary} size={18} />
                            <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                            <TouchableOpacity onPress={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}>
                                <X color={Colors.textMuted} size={16} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <TouchableOpacity onPress={handleSubmit} activeOpacity={0.9}>
                    <LinearGradient colors={["#0469cd", "#003061"]} style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Submit for Review</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Dropdown Modal */}
            <Modal visible={isDropdownOpen} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setIsDropdownOpen(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Subject</Text>
                            <TouchableOpacity onPress={() => setIsDropdownOpen(false)}><X color={Colors.dark} size={20} /></TouchableOpacity>
                        </View>
                        <ScrollView>
                            {subjects.map((s) => (
                                <TouchableOpacity 
                                    key={s.id} 
                                    style={[styles.dropdownItem, selectedSubject?.id === s.id && styles.dropdownItemSelected]}
                                    onPress={() => { setSelectedSubject(s); setIsDropdownOpen(false); }}
                                >
                                    <Text style={[styles.dropdownItemText, selectedSubject?.id === s.id && styles.dropdownItemTextSelected]}>{s.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Success Modal Example (Simple) */}
            <Modal visible={isSuccessModalOpen} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.statusModalContent}>
                        <CheckCircle color="#10B981" size={48} />
                        <Text style={styles.modalTitle}>{successTitle}</Text>
                        <Text style={styles.subtitle}>{successMessage}</Text>
                        <TouchableOpacity style={styles.statusButton} onPress={() => setIsSuccessModalOpen(false)}>
                            <Text style={styles.statusButtonText}>Great!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    contentContainer: { padding: Spacing[4], paddingBottom: Spacing[10] },
    header: { marginTop: Spacing[6], marginBottom: Spacing[6] },
    title: { fontFamily: Typography.fontFamily.header, fontSize: Typography["3xl"], color: Colors.dark },
    subtitle: { fontFamily: Typography.fontFamily.body, fontSize: Typography.base, color: Colors.textMuted, marginTop: 4 },
    form: { gap: Spacing[4] },
    inputGroup: { marginBottom: Spacing[2] },
    label: { fontFamily: Typography.fontFamily.header, fontSize: Typography.base, color: Colors.dark, marginBottom: 8 },
    required: { color: Colors.danger },
    input: { backgroundColor: Colors.surface, borderRadius: Layout.borderRadius.md, padding: 14, fontSize: 16, color: Colors.dark, borderWidth: 1, borderColor: Colors.softBlue },
    dropdown: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: Colors.surface, borderRadius: Layout.borderRadius.md, padding: 14, borderWidth: 1, borderColor: Colors.softBlue },
    dropdownText: { fontSize: 16, color: Colors.dark, flex: 1 },
    dropdownPlaceholder: { color: Colors.textMuted },
    uploadButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#EEF2FF", borderRadius: Layout.borderRadius.md, paddingVertical: 16, borderStyle: "dashed", borderWidth: 2, borderColor: Colors.primary, gap: 8 },
    uploadButtonText: { color: Colors.primary, fontFamily: Typography.fontFamily.header, fontSize: 16 },
    fileItem: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, borderRadius: Layout.borderRadius.sm, padding: 12, marginTop: 8, borderWidth: 1, borderColor: Colors.softBlue, gap: 12 },
    fileName: { flex: 1, fontSize: 14, color: Colors.dark },
    submitButton: { borderRadius: Layout.borderRadius.lg, paddingVertical: 16, alignItems: "center", marginTop: Spacing[4], elevation: 4 },
    submitButtonText: { color: Colors.light, fontFamily: Typography.fontFamily.header, fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
    modalContent: { backgroundColor: Colors.surface, borderRadius: 20, maxHeight: "70%" },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.softBlue },
    modalTitle: { fontFamily: Typography.fontFamily.header, fontSize: 18 },
    dropdownItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.light },
    dropdownItemSelected: { backgroundColor: Colors.softBlue },
    dropdownItemText: { fontFamily: Typography.fontFamily.body, fontSize: 16 },
    dropdownItemTextSelected: { color: Colors.primary, fontWeight: "700" },
    statusModalContent: { backgroundColor: Colors.surface, padding: 30, borderRadius: 24, alignItems: 'center' },
    statusButton: { backgroundColor: Colors.dark, paddingHorizontal: 40, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
    statusButtonText: { color: Colors.light, fontWeight: '700' }
});